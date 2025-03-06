import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Card, Container, Row, Col } from 'react-bootstrap'
import '../auth/login.css'

const data = [
  { name: 'Concept', value: 40, color: '#17a2b8' },
  { name: 'Feasibility', value: 20, color: '#dc3545' },
  { name: 'Desing', value: 40, color: '#17a2b8' },
  { name: 'Production', value: 40, color: '#17a2b8' },
  { name: 'withdrawal', value: 40, color: '#dc3545' },
  { name: 'StandBy', value: 40, color: 'orange' },
  { name: 'Cancelled', value: 20, color: 'orange' },
]

function Dashboard() {
  return (
    <div className="color-overlay d-flex">
      <Container fluid>
        <Row
          className="vh-100 justify-content-end "
          style={{ paddingTop: '80px' }}
        >
          <Col xs="auto">
            <Card className="p-3 bg-dark text-light">
              <h5>Stages Statistics</h5>

              <PieChart width={300} height={300}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              <p className="text-light" style={{ paddingTop: '20px' }}>
                📅 Data from the last 90 days
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard
