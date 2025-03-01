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
import './product.tsx'

interface Product {
  _id: string
  name: string
  description: string
  stage: string
  created_at: string
  estimated_weight?: number
  estimated_height?: string
  estimated_width?: string
  length_unit: string
}

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
    .toLowerCase()
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
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStage, setEditStage] = useState('')
  const [editEstimatedHeight, setEditEstimatedHeight] = useState('')
  const [editEstimatedWidth, setEditEstimatedWidth] = useState('')
  const [editEstimatedWeight, setEditEstimatedWeight] = useState('')
  const [editWeightUnit, setEditWeightUnit] = useState('')
  const [editWidthUnit, setEditWidthUnit] = useState('')
  const [editHeightUnit, setEditHeightUnit] = useState('')

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, products])

  const cacheRef = useRef<{
    [key: number]: { products: Product[]; hasNext: boolean; timestamp: number }
  }>({})

  const [, executeUpdate] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/update-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )
  useEffect(() => {
    if (selectedProduct) {
      setEditName(selectedProduct.name || '')
      setEditDescription(selectedProduct.description || '')
      setEditStage(selectedProduct.stage || '')
      setEditEstimatedHeight(selectedProduct.estimated_height?.toString() || '')
      setEditEstimatedWidth(selectedProduct.estimated_width?.toString() || '')
      setEditEstimatedWeight(selectedProduct.estimated_weight?.toString() || '')
      //setEditWeightUnit(selectedProduct.weight_unit || '')
      // setEditWidthUnit(selectedProduct.width_unit || '')
      // setEditHeightUnit(selectedProduct.height_unit || '')
    }
  }, [selectedProduct])
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
      } catch (err) {}
    }
    fetchData()
  }, [currentPage, execute])

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
          estimated_height: parseFloat(editEstimatedHeight),
          estimated_width: parseFloat(editEstimatedWidth),
          estimated_weight: parseFloat(editEstimatedWeight),
          weight_unit: editWeightUnit,
          width_unit: editWidthUnit,
          height_unit: editHeightUnit,

          modifyID: modifyID,
          code_verifier: code_verifier,
        },
        withCredentials: true,
      })

      handleEditClose()
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
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
      header: 'Status',
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

      {/* Modify Modal */}
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
                type="text"
                value={editStage}
                onChange={(e) => setEditStage(e.target.value)}
              />
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
                Estimated weight (kg):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedWeight}
                onChange={(e) => setEditEstimatedWeight(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Weight Unit:</Form.Label>
              <Form.Control
                type="text"
                value={editWeightUnit}
                onChange={(e) => setEditWeightUnit(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Width Unit:</Form.Label>
              <Form.Control
                type="text"
                value={editWidthUnit}
                onChange={(e) => setEditWidthUnit(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Height Unit:</Form.Label>
              <Form.Control
                type="text"
                value={editHeightUnit}
                onChange={(e) => setEditHeightUnit(e.target.value)}
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
    </>
  )
}

export default Products
