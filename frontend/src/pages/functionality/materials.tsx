import { useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Button, Modal, Spinner, Form, Container } from 'react-bootstrap'
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import useAxios from 'axios-hooks'
import './materials.css'
import './products.css'
import AddMaterialModal from './addmaterial'
import UpdateMaterialModal from './updatematerial'
import axios from 'axios'
interface Material {
  _id: string
  name: string
  description: string
  estimated_height: number
  estimated_width: number
  estimated_weight: number
  qty: number
  weight_unit: string
  height_unit: string
  length_unit: string
  width_unit: string
  product_id: string
  product_name: string
  created_at: string
  updated_at: string
}

const PAGE_SIZE = 10
const CACHE_EXPIRY_MS = 30 * 1000

const generateCodeVerifier = (length: number): string => {
  const allowedChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomArray = new Uint8Array(length)
  crypto.getRandomValues(randomArray)
  return Array.from(
    randomArray,
    (byte) => allowedChars[byte % allowedChars.length]
  ).join('')
}
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0) + word.slice(1))
    .join(' ')
}
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function Materials() {
  const { productId } = useParams<{ productId: string }>()
  const [currentPage, setCurrentPage] = useState(1)
  const [materials, setMaterials] = useState<Material[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  )

  const cacheRef = useRef<{
    [key: string]: {
      materials: Material[]
      hasNext: boolean
      timestamp: number
    }
  }>({})

  // Axios hooks for API calls.
  const [, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/get-materials',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

  const [, executeInit] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/initiate_material',
      method: 'POST',
    },
    { manual: true }
  )

  const [, executeDelete] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/delete-material',
      method: 'POST',
    },
    { manual: true }
  )

  // Fetch materials when productId, currentPage, or searchTerm changes.
  useEffect(() => {
    const fetchMaterials = async () => {
      setError(null)
      setLoadingState(true)
      // Create a cache key including page and search term.
      const cacheKey = `${currentPage}-${searchTerm}`
      const now = Date.now()
      const cached = cacheRef.current[cacheKey]
      if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
        setMaterials(cached.materials)
        setHasNextPage(cached.hasNext)
        setLoadingState(false)
        return
      }

      try {
        let response
        if (searchTerm)
          response = await execute({
            data: {
              productId: unslugify(productId || ''),
              page: currentPage,
              // Pass searchTerms (empty string if not provided)
              searchTerms: searchTerm,
            },
          })
        else
          response = await execute({
            data: {
              productId: unslugify(productId || ''),
              page: currentPage,
            },
          })

        const data = response.data
        if (!data || data.length === 0) {
          setError('No materials found')
          setMaterials([])
          setHasNextPage(false)
        } else {
          setMaterials(data)
          setHasNextPage(data.length === PAGE_SIZE)
          cacheRef.current[cacheKey] = {
            materials: data,
            hasNext: data.length === PAGE_SIZE,
            timestamp: Date.now(),
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
          if (
            err.response.data &&
            err.response.data.errors &&
            err.response.data.errors.length > 0
          ) {
            setError(err.response.data.errors[0].message)
            setMaterials([])
            if (
              err.response.data.errors[0].message ===
              'searchTerms can only contain letters, numbers, and spaces.'
            ) {
              setError('Search cannot contain symbols.')
              setMaterials([])
            }
          } else if (err.response.data.message) {
            setError(err.response.data.message)
            setMaterials([])
          }
        } else {
          setMaterials([])
        }
      }
      setLoadingState(false)
    }

    if (productId) {
      fetchMaterials()
    } else {
      setError('Product ID is missing')
    }
  }, [currentPage, productId, searchTerm, execute])

  // Trigger search on Enter key: reset page, update searchTerm, and clear cache.
  const triggerSearch = () => {
    setCurrentPage(1)
    setSearchTerm(searchInput)
    cacheRef.current = {}
  }

  // Modal & deletion handlers.
  const handleShow = (id: string) => {
    setSelectedId(id)
    setShowModal(true)
  }
  const handleClose = () => {
    setShowModal(false)
    setSelectedId(null)
  }
  const handleDelete = async () => {
    if (selectedId) {
      try {
        const materialToDelete = materials.find((m) => m._id === selectedId)
        if (!materialToDelete) {
          console.error('Material not found')
          return
        }
        const code_verifier = generateCodeVerifier(43)
        const challenge = await generateCodeChallenge(code_verifier)
        const initRes = await executeInit({
          data: { challenge },
          withCredentials: true,
        })
        const modifyID = initRes.data.id

        await executeDelete({
          data: {
            productId: materialToDelete.product_id,
            name: materialToDelete.name,
            modifyID: modifyID,
            code_verifier: code_verifier,
          },
          withCredentials: true,
        })

        setMaterials((prev) => prev.filter((m) => m._id !== selectedId))
        // Invalidate cache for the current page/search.
        delete cacheRef.current[`${currentPage}-${searchTerm}`]
        cacheRef.current = {}
        window.location.reload()
      } catch (error) {
        console.error(error)
      }
    }
    handleClose()
  }

  const handleAddShow = () => setShowAddModal(true)
  const handleAddClose = () => setShowAddModal(false)
  const handleEditShow = (material: Material) => {
    setSelectedMaterial(material)
    setShowEditModal(true)
  }
  const handleEditClose = () => setShowEditModal(false)
  const refreshMaterials = async () => {
    // Clear cache and reset to first page.
    cacheRef.current = {}
    setCurrentPage(1)
    await triggerSearch()
    window.location.reload()
  }

  // Columns for the table.
  const columns = [
    {
      accessorKey: 'index',
      header: 'ID',
      cell: ({ row }: { row: { index: number } }) =>
        (currentPage - 1) * PAGE_SIZE + row.index + 1,
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'qty',
      header: 'Quantity',
    },
    {
      accessorKey: 'dimensions',
      header: 'Dimensions (cm)',
      cell: ({ row }: { row: { original: Material } }) => {
        const m = row.original
        return `${m.estimated_height} x ${m.estimated_width} x ${m.length_unit}`
      },
    },
    {
      accessorKey: 'weight',
      header: 'Weight (kg)',
      cell: ({ row }: { row: { original: Material } }) => {
        const m = row.original
        return `${m.estimated_weight}`
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: Material } }) =>
        new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: Material } }) => (
        <div
          className="d-flex justify-content-center gap-2"
          style={{ height: '100%' }}
        >
          <FaEdit
            style={{ color: 'rgb(255, 165, 0)', cursor: 'pointer' }}
            title="Edit"
            onClick={() => handleEditShow(row.original)}
          />
          <FaTrash
            style={{ color: '#F64B4B', cursor: 'pointer' }}
            title="Delete"
            onClick={() => handleShow(row.original._id)}
          />
        </div>
      ),
    },
  ]

  // Use materials directly since backend search returns filtered results.
  const table = useReactTable({
    columns,
    data: materials,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div
        className="color-overlay d-flex justify-content-center align-items-center min-vh-100"
        style={{ paddingTop: '150px', padding: '80px' }}
      >
        <div
          className="table-responsive position-relative"
          style={{
            borderRadius: '20px',
            margin: '0 auto',
            maxWidth: '1500px',
            width: '100%',
            backgroundColor: '#343a40',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
          }}
        >
          {loadingState && (
            <div className="loading-overlay">
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="light" />
              </div>
            </div>
          )}
          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}
          <Container fluid>
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-center justify-content-end mb-3 ">
                <Form.Control
                  type="text"
                  placeholder="Search by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      triggerSearch()
                    }
                  }}
                  style={{
                    maxWidth: '600px',
                    fontSize: '14px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div className="mq">
                <FaPlusCircle
                  size={24}
                  style={{ color: 'green', cursor: 'pointer' }}
                  title="Add Material"
                  onClick={handleAddShow}
                />
              </div>
            </div>
            <table
              className="table table-dark table-striped table-hover text-center"
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0',
                borderRadius: '15px',
                overflow: 'hidden',
                opacity: loadingState ? 0.5 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Container>
          <div className="d-flex justify-content-end mt-3">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-dark"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Previous
            </Button>
            <span
              className="mx-2 text-light"
              style={{
                fontSize: '12px',
                paddingTop: '6px',
                paddingLeft: '10px',
              }}
            >
              Page {currentPage}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="btn btn-dark ms-2"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Material Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={handleClose}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this material? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Material Modal */}
      <AddMaterialModal
        show={showAddModal}
        onClose={handleAddClose}
        onSuccess={refreshMaterials}
      />
      <UpdateMaterialModal
        show={showEditModal}
        onClose={handleEditClose}
        onSuccess={refreshMaterials}
        selectedMaterial={selectedMaterial}
      />
    </>
  )
}

export default Materials
