import { Card, Container, Row, Col } from 'react-bootstrap'
// import { TrendingUp } from "lucide-react"
// import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import '../auth/login.css'

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

function Dashboard2() {
  return (
    <div className="color-overlay">
      <Container fluid>
        <Row
          className="vh-100 justify-content-end"
          style={{ paddingTop: '80px' }}
        >
          <Col xs="12" className="mb-4">
            <Row>
              {stats.map((stat, index) => (
                <Col key={index} md={3} sm={6} className="mb-3">
                  <Card className="p-3 text-center bg-dark text-light shadow-sm">
                    <h6>{stat.title}</h6>
                    <h2 className="fw-bold">{stat.value}</h2>
                    <p className="text-success mb-1">{stat.change}</p>
                    <small>{stat.description}</small>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
export default Dashboard2
