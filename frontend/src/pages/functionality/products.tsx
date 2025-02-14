import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import { FaEdit, FaTrash, FaFilePdf, FaCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import './products.css'

const ClickableName = ({ name, id }: { name: string; id: number }) => {
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

const columns = [
  { accessorKey: 'id', header: 'Number' },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: { original: { name: string; id: number } } }) => (
      <ClickableName name={row.original.name} id={row.original.id} />
    ),
  },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: () => (
      <div className="d-flex justify-content-center align-items-center">
        <FaCircle style={{ color: 'green' }} />
      </div>
    ),
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => (
      <div
        className="d-flex justify-content-center gap-2"
        style={{ height: '100%' }}
      >
        <FaEdit
          style={{ color: 'rgb(255, 165, 0)', cursor: 'pointer' }}
          title="Edit"
        />
        <FaTrash
          style={{ color: '#F64B4B', cursor: 'pointer' }}
          title="Delete"
        />
        <FaFilePdf
          style={{ color: 'white', cursor: 'pointer' }}
          title="PDF Report"
        />
      </div>
    ),
  },
]

const data = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: 'Door',
  status: 'Released',
  active: 'true',
}))

function Products() {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            className="btn btn-dark"
            style={{ fontSize: '12px', height: '30px' }}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Products
