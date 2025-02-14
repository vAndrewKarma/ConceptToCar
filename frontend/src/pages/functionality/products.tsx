import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import 'bootstrap/dist/css/bootstrap.min.css'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nume' },
  { accessorKey: 'age', header: 'Vârstă' },
]

const data = [
  { id: 1, name: 'Alex', age: 25 },
  { id: 2, name: 'Maria', age: 30 },
]

function Products() {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="color-overlay">
      <div className="table-responsive">
        <table className="table table-striped">
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
      </div>
    </div>
  )
}

export default Products
