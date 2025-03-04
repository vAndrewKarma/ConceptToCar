import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Modal, Spinner, Form } from 'react-bootstrap'
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import useAxios from 'axios-hooks'
import { useMemo } from 'react'
import './products.css'

import AddProductModal from './addprod.tsx'

export type Stage =
  | 'concept'
  | 'feasibility'
  | 'design'
  | 'production'
  | 'withdrawal'
  | 'standby'
  | 'cancelled'

// Update the full stages list
const allStages: Stage[] = [
  'concept',
  'feasibility',
  'design',
  'production',
  'withdrawal',
  'standby',
  'cancelled',
]

// Helper function: for Designers, allow only the current stage or the next stage.
function getAllowedStages(currentStage: Stage, role: string): Stage[] {
  if (role === 'Designer') {
    const idx = allStages.indexOf(currentStage)
    if (idx === -1) return []
    return idx < allStages.length - 1
      ? [allStages[idx], allStages[idx + 1]]
      : [allStages[idx]]
  }
  // Other roles get all options.
  return allStages
}

interface Product {
  _id: string
  name: string
  description: string
  stage: Stage
  created_at: string
  estimated_weight?: number
  estimated_height?: string
  estimated_width?: string
  length_unit: string
}

// Assume PAGE_SIZE and CACHE_EXPIRY_MS remain the same.
const PAGE_SIZE = 15
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

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

const ClickableName = ({ name, id }: { name: string; id: string }) => {
  const navigate = useNavigate()
  const slug = slugify(name)
  return (
    <span
      style={{ color: 'white', cursor: 'pointer' }}
      onClick={() => navigate(`/product/${slug}/${id}`)}
    >
      {name}
    </span>
  )
}

function Products() {
  // Assume currentUserRole comes from auth/session.
  // For demo purposes, you can change it to "Admin", "Designer", "Seller", or "Portfolio Manager".
  const currentUserRole = 'Designer'

  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Controlled fields for editing
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStage, setEditStage] = useState<Stage>('concept')
  const [editEstimatedHeight, setEditEstimatedHeight] = useState('')
  const [editEstimatedWidth, setEditEstimatedWidth] = useState('')
  const [editEstimatedWeight, setEditEstimatedWeight] = useState('')
  const [editEstimatedLength, setEditEstimatedLength] = useState('')
  const refreshProducts = async () => {
    cacheRef.current = {}
    setCurrentPage(1)
    // Re-fetch by calling execute or other mechanism.
    await execute({ data: { page: 1 } })
  }
  // Compute allowed stage options based on the product's current stage and the user role.
  const allowedStages: Stage[] = selectedProduct
    ? getAllowedStages(selectedProduct.stage, currentUserRole)
    : allStages

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) =>
      product.name.includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, products])

  const cacheRef = useRef<{
    [key: number]: { products: Product[]; hasNext: boolean; timestamp: number }
  }>({})

  const [{ loading, error }, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/get-products',
      method: 'POST',
      withCredentials: true,
      data: { page: currentPage },
    },
    { manual: true }
  )

  const [, executeInit] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/initiate_product',
      method: 'POST',
    },
    { manual: true }
  )

  const [, executeUpdate] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/update-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

  const [, executedelete] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/delete-product',
      method: 'POST',
    },
    { manual: true }
  )

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now()
      const cached = cacheRef.current[currentPage]
      if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
        setProducts(cached.products)
        setHasNextPage(cached.hasNext)
        return
      }
      try {
        const response = await execute({ data: { page: currentPage } })
        if (response.data) {
          const { products, hasNext } = response.data
          cacheRef.current[currentPage] = {
            products,
            hasNext,
            timestamp: Date.now(),
          }
          setProducts(products)
          setHasNextPage(hasNext)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [currentPage, execute])

  useEffect(() => {
    if (selectedProduct) {
      setEditName(selectedProduct.name || '')
      setEditDescription(selectedProduct.description || '')
      setEditStage(selectedProduct.stage || 'concept')
      setEditEstimatedHeight(selectedProduct.estimated_height?.toString() || '')
      setEditEstimatedWidth(selectedProduct.estimated_width?.toString() || '')
      setEditEstimatedWeight(selectedProduct.estimated_weight?.toString() || '')
      // Set unit fields if available.
    }
  }, [selectedProduct])

  const handleShow = (id: string) => {
    setSelectedId(id)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setSelectedId(null)
  }
  const handleEditShow = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }
  const handleEditClose = () => {
    setShowEditModal(false)
    setSelectedProduct(null)
  }

  const handleAddShow = (product: Product) => {
    setSelectedProduct(product)
    setShowAddModal(true)
  }
  const handleAddClose = () => {
    setShowAddModal(false)
    setSelectedProduct(null)
  }

  const handleSaveChanges = async () => {
    if (!selectedProduct) return
    try {
      const code_verifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(code_verifier)
      const initRes = await executeInit({
        data: { challenge },
        withCredentials: true,
      })
      const modifyID = initRes.data.id
      await executeUpdate({
        data: {
          productId: selectedProduct._id,
          name: editName,
          description: editDescription,
          stage: editStage, // stage updated from dropdown
          estimated_height: parseFloat(editEstimatedHeight),
          estimated_width: parseFloat(editEstimatedWidth),
          estimated_weight: parseFloat(editEstimatedWeight),
          modifyID: modifyID,
          code_verifier: code_verifier,
        },
        withCredentials: true,
      })
      handleEditClose()
      window.location.reload()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDelete = async () => {
    if (selectedId !== null) {
      try {
        const productToDelete = products.find((p) => p._id === selectedId)
        if (!productToDelete) {
          console.error('Product not found')
          return
        }
        const code_verifier = generateCodeVerifier(43)
        const challenge = await generateCodeChallenge(code_verifier)
        const res = await executeInit({
          data: { challenge },
          withCredentials: true,
        })
        const modifyID = res.data.id
        await executedelete({
          data: {
            productId: selectedId,
            modifyID: modifyID,
            code_verifier: code_verifier,
            name: productToDelete.name,
          },
          withCredentials: true,
        })
        setProducts((prev) =>
          prev.filter((product) => product._id !== selectedId)
        )
        delete cacheRef.current[currentPage]
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
    handleClose()
  }

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
      cell: ({ row }: { row: { original: Product } }) => (
        <ClickableName name={row.original.name} id={row.original._id} />
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }: { row: { original: Product } }) => (
        <span style={{ textTransform: 'capitalize' }}>
          {row.original.stage}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: Product } }) =>
        new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: Product } }) => (
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

  const table = useReactTable({
    columns,
    data: filteredProducts,
    getCoreRowModel: getCoreRowModel(),
  })

  if (error)
    return (
      <div className="text-light text-center mt-5">
        Error loading products: {error.message}
      </div>
    )

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
          {loading && (
            <div className="loading-overlay">
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="light" />
              </div>
            </div>
          )}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Form.Control
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-25"
              style={{ fontSize: '14px', marginBottom: '10px' }}
            />
            <div style={{ paddingRight: '15px' }}>
              <FaPlusCircle
                size={24}
                style={{ color: 'green', cursor: 'pointer' }}
                title="Add Material"
                onClick={() => handleAddShow({} as Product)}
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
              opacity: loading ? 0.5 : 1,
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

          <div className="d-flex justify-content-end mt-3">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              onMouseDown={(e) => e.preventDefault()}
              className="btn btn-dark"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Previous
            </Button>
            <span
              className="text-light"
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
              onMouseDown={(e) => e.preventDefault()}
              className="btn btn-dark ms-2"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
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
            Are you sure you want to delete this product? This action cannot be
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleEditClose} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark shadow-lg">
          <Form className="text-light modal-form rounded">
            <Form.Group>
              <Form.Label className="modal-style">Name:</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Description:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Stage:</Form.Label>
              <Form.Control
                as="select"
                value={editStage || ''}
                onChange={(e) => setEditStage(e.target.value as Stage)}
              >
                <option value="" disabled style={{ fontWeight: 'bold' }}>
                  Stage
                </option>
                {[
                  'Concept',
                  'Feasibility',
                  'Design',
                  'Production',
                  'Withdrawal',
                  'Stand-by',
                  'Canceled',
                  ...allowedStages,
                ].map((stageOption, idx) => (
                  <option key={idx} value={stageOption}>
                    {stageOption}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated length (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedHeight}
                onChange={(e) => setEditEstimatedHeight(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated width (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedWidth}
                onChange={(e) => setEditEstimatedWidth(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated height (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedLength}
                onChange={(e) => setEditEstimatedLength(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated weight (kg):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedWeight}
                onChange={(e) => setEditEstimatedWeight(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={handleEditClose}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <AddProductModal
        show={showAddModal}
        onClose={handleAddClose}
        onSuccess={refreshProducts}
      />
    </>
  )
}

export default Products
