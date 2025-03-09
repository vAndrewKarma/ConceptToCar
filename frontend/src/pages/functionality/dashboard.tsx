import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Card, Container, Row, Col } from 'react-bootstrap'
import '../auth/login.css'

const data = [
  { name: 'Concept', value: 40, color: '#17a2b8' },
  { name: 'Feasibility', value: 20, color: '#cfc208' },
  { name: 'Design', value: 40, color: '#eb02df' },
  { name: 'Production', value: 40, color: '#2c9901' },
  { name: 'Withdrawal', value: 40, color: '#6100cf' },
  { name: 'StandBy', value: 40, color: '#ff5e00' },
  { name: 'Cancelled', value: 20, color: '#dc3545' },
]

const stats = [
  {
    title: 'Total Accounts',
    value: '10',
    change: '↑ 20%',
    description: 'vs previous 30 days',
  },
  {
    title: 'Total Products',
    value: '37',
    change: '↑ 15',
    description: 'vs previous 30 days',
  },
  {
    title: 'Average Contract',
    value: '$1,553',
    change: '↑ 7.3%',
    description: 'vs previous 30 days',
  },
  {
    title: 'Growth Rate',
    value: '8.29%',
    change: '↑ 1.3%',
    description: 'vs previous 30 days',
  },
]

function Dashboard() {
  return (
    <div className="color-overlay d-flex">
      <Container fluid>
        <Row
          className="vh-100 justify-content-end"
          style={{ paddingTop: '80px' }}
        >
          <Col xs="12" className="mb-4">
            <Row>
              {stats.map((stat, index) => (
                <Col key={index} md={3} sm={6} className="mb-3">
                  <Card className="p-3 text-center  bg-dark text-light shadow-sm ">
                    <h6>{stat.title}</h6>
                    <h2 className="fw-bold">{stat.value}</h2>
                    <p className="text-success mb-1">{stat.change}</p>
                    <small>{stat.description}</small>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs="auto">
            <Card className="p-3 bg-dark text-light">
              <h5>Stages Statistics</h5>
              <PieChart width={500} height={500}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard
