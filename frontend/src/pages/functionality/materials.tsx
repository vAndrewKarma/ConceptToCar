import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Modal } from 'react-bootstrap'
import { FaEdit, FaTrash } from 'react-icons/fa'

import { useState } from 'react'
import '../auth/login.css'

function Materials() {
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [tableData, setTableData] = useState(
    Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      name: i % 2 === 0 ? 'Copper' : 'Steel',
      weight: i % 2 === 0 ? '1.25' : '2.75',
      dimensions: i % 2 === 0 ? '10x10x10' : '20x20x20',
      price: i % 2 === 0 ? '$5.00' : '$10.00',
      quantity: i % 2 === 0 ? '5' : '10',
      createdAt: i % 2 === 0 ? '3/01/2025' : '2/28/2025',
    }))
  )

  const handleShow = (id: number) => {
    setSelectedId(id)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setSelectedId(null)
  }

  const handleDelete = () => {
    if (selectedId !== null) {
      setTableData((prevData) =>
        prevData.filter((item) => item.id !== selectedId)
      )
      console.log(`Deleted product with ID: ${selectedId}`)
    }
    handleClose()
  }

  const columns = [
    { accessorKey: 'id', header: 'Index' },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'weight', header: 'Weight (kg)' },
    {
      accessorKey: 'dimensions',
      header: 'Dimensions (cm)',
    },
    { accessorKey: 'price', header: ' Production Price' },
    { accessorKey: 'createdAt', header: 'Created At' },

    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: { id: number } } }) => (
        <div
          className="d-flex justify-content-center gap-2"
          style={{ height: '100%' }}
        >
          <div
            className="d-flex justify-content-center"
            style={{ height: '100%' }}
          >
            <FaEdit
              style={{ color: 'rgb(255, 165, 0)', cursor: 'pointer' }}
              title="Edit"
            />
          </div>

          <FaTrash
            style={{ color: '#F64B4B', cursor: 'pointer' }}
            title="Delete"
            onClick={() => handleShow(row.original.id)}
          />
        </div>
      ),
    },
  ]

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  return (
    <>
      <div
        className="color-overlay d-flex justify-content-center align-items-center min-vh-100"
        style={{ paddingTop: '150px', padding: '80px' }}
      >
        <div
          className="table-responsive"
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
          <table
            className="table table-dark table-striped table-hover text-center"
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              borderRadius: '15px',
              overflow: 'hidden',
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
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              onMouseDown={(e) => e.preventDefault()}
              className="btn btn-dark"
              style={{ fontSize: '12px', height: '30px' }}
              size="sm"
            >
              Previous
            </Button>
            <span
              className="mx-2 text-light"
              style={{ fontSize: '12px', paddingTop: '6px' }}
            >
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              onMouseDown={(e) => e.preventDefault()}
              className="btn btn-dark"
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

export default Materials
