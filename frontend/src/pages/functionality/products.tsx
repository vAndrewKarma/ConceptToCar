import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import useAxios from 'axios-hooks'
import './products.css'

interface Product {
  _id: string
  name: string
  description: string
  stage: string
  created_at: string
}

const PAGE_SIZE = 15
const CACHE_EXPIRY_MS = 30 * 1000

const ClickableName = ({ name, id }: { name: string; id: string }) => {
  const navigate = useNavigate()
  return (
    <span
      style={{ color: 'white', cursor: 'pointer' }}
      onClick={() => navigate(`/product/${id}`)}
    >
      {name}
    </span>
  )
}

const Edit = ({ id }: { id: string }) => {
  const navigate = useNavigate()
  return (
    <div className="d-flex justify-content-center" style={{ height: '100%' }}>
      <FaEdit
        style={{ color: 'rgb(255, 165, 0)', cursor: 'pointer' }}
        title="Edit"
        onClick={() => navigate(`/product/${id}`)}
      />
    </div>
  )
}

function Products() {
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])

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
          const receivedProducts = response.data.products || []
          const hasNext = receivedProducts.length === PAGE_SIZE + 1
          const productsToShow = hasNext
            ? receivedProducts.slice(0, PAGE_SIZE)
            : receivedProducts

          cacheRef.current[currentPage] = {
            products: productsToShow,
            hasNext,
            timestamp: Date.now(),
          }

          setProducts(productsToShow)
          setHasNextPage(hasNext)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      }
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

  const handleDelete = () => {
    if (selectedId !== null) {
      setProducts((prev) =>
        prev.filter((product) => product._id !== selectedId)
      )
      delete cacheRef.current[currentPage]
      console.log(`Deleted product with ID: ${selectedId}`)
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
      header: 'Created At',
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
          <Edit id={row.original._id} />
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
    data: products,
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
              className="btn btn-dark"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Previous
            </Button>
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
    </>
  )
}

export default Products
