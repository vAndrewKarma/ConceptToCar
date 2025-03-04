import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap'
import { FaChartBar, FaUsers, FaClipboardList } from 'react-icons/fa'
import useAxios from 'axios-hooks'
import '../auth/login.css'

function Dashboard() {
  const [{ data, loading }] = useAxios('https://api.example.com/stats')

  return (
    <div className="color-overlay">
      <Container fluid className="p-4 bg-dark text-light">
        <h2 className="mb-4">Dashboard</h2>

        {/* Secțiunea de statistici */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <FaUsers size={30} />
                <Card.Title>Utilizatori</Card.Title>
                <Card.Text>{loading ? '...' : data?.users}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <FaChartBar size={30} />
                <Card.Title>Vânzări</Card.Title>
                <Card.Text>{loading ? '...' : `$${data?.sales}`}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-warning text-dark">
              <Card.Body>
                <FaClipboardList size={30} />
                <Card.Title>Comenzi</Card.Title>
                <Card.Text>{loading ? '...' : data?.orders}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabel cu ultimele produse */}
        <Card className="bg-secondary">
          <Card.Body>
            <Card.Title>Ultimele produse</Card.Title>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nume</th>
                  <th>Stare</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Se încarcă...
                    </td>
                  </tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data?.products?.map((product: any) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.status}</td>
                      <td>
                        <Button variant="outline-light" size="sm">
                          Vezi
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Dashboard
