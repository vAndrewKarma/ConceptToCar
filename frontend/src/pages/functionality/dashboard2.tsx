import { Card, Container, Row, Col } from 'react-bootstrap'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import '../auth/login.css'
import './dashboard2.css'

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

const data = [
  { name: 'January', value: 186 },
  { name: 'February', value: 305 },
  { name: 'March', value: 237 },
  { name: 'April', value: 73 },
  { name: 'May', value: 209 },
  { name: 'June', value: 214 },
]

function Dashboard2() {
  return (
    <div className=" color-overlay scroll-container">
      <Container fluid>
        {/* Secțiunea cu statisticile */}
        <Row className="justify-content-center " style={{ paddingTop: '80px' }}>
          {stats.map((stat, index) => (
            <Col key={index} md={3} sm={6} xs={12} className="mb-3">
              <Card className="p-3 text-center bg-dark text-light shadow-sm">
                <h6 className="stat-title">{stat.title}</h6>
                <h2 className="fw-bold stat-value">{stat.value}</h2>
                <p className="text-success mb-1">{stat.change}</p>
                <small>{stat.description}</small>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Secțiunea cu graficul */}
        <Row className="justify-content-center">
          <Col lg={8} md={10} sm={12} xs={12}>
            <Card className="p-3 bg-dark text-white shadow chart-card">
              <h5 className="chart-title">Bar Chart - Custom Label</h5>
              <p className="chart-subtitle">January - June 2024</p>
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ left: 30, right: 20 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#287bff" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center">Loading chart...</p>
              )}
              <p className="mt-3">
                <strong>Trending up by 5.2% this month 🔼</strong>
              </p>
              <p className="text-muted">
                Showing total visitors for the last 6 months
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard2
