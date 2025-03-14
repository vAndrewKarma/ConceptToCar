import { Card, Container, Row, Col } from 'react-bootstrap'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts'
import { useState, useEffect } from 'react'
import '../auth/login.css'
import './dashboard.css'

const stats = [
  {
    title: 'Total Accounts',
    value: '10',
  },
  {
    title: 'Total Products',
    value: '37',
  },
  {
    title: 'Average Contract',
    value: '$1,553',
  },
  {
    title: 'Growth Rate',
    value: '8.29%',
  },
]

const barChartData = [
  { name: 'January', value: 186 },
  { name: 'February', value: 305 },
  { name: 'March', value: 237 },
  { name: 'April', value: 73 },
  { name: 'May', value: 209 },
  { name: 'June', value: 214 },
]

const pieChartData = [
  { name: 'Concept', value: 40 },
  { name: 'Feasibility', value: 20 },
  { name: 'Design', value: 40 },
  { name: 'Production', value: 40 },
  { name: 'Withdrawal', value: 40 },
  { name: 'StandBy', value: 40 },
  { name: 'Cancelled', value: 20 },
]

const COLORS = [
  '#17a2b8',
  '#cfc208',
  '#eb02df',
  '#2c9901',
  '#7851ac',
  '#ff5e00',
  '#dc3545',
]

function Dashboard2() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalValue = pieChartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="color-background scroll-container">
      <Container fluid>
        {/* Secțiunea cu statisticile */}
        <Row className="justify-content-center " style={{ paddingTop: '80px' }}>
          {stats.map((stat, index) => (
            <Col key={index} md={3} sm={6} xs={12} className="mb-3">
              <Card className="p-3 text-center bg-dark text-light shadow-sm">
                <h6 className="stat-title">{stat.title}</h6>
                <h2 className="fw-bold stat-value">{stat.value}</h2>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Secțiunea cu graficele */}
        <Row className="justify-content-center" style={{ paddingTop: '40px' }}>
          <Col lg={8} md={10} sm={12} xs={12} className="mb-4">
            <Card className="p-3 bg-dark text-white shadow chart-card">
              <h5 className="chart-title">Bar Chart - Custom Label</h5>
              <p className="chart-subtitle">January - June 2024</p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  layout="vertical"
                  data={barChartData}
                  margin={{ left: 30, right: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 40 : 100}
                  />
                  <Bar dataKey="value" fill="#287bff" barSize={25}>
                    <LabelList
                      dataKey="value"
                      position="right"
                      fill="white"
                      fontSize={14}
                      fontWeight="bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-3">
                <strong>Trending up by 5.2% this month 🔼</strong>
              </p>
            </Card>
          </Col>

          {/*  AICI AM ADAUGAT PIE CHART-UL */}
          <Col lg={4} md={10} sm={12} xs={12}>
            <Card className="p-3 bg-dark text-white shadow chart-card ">
              <h5 className="chart-title">Stage Statistics</h5>
              <p className="chart-subtitle">January - June 2024</p>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart className="pie-font" style={{ fontSize: '16px' }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 90 : 140}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) =>
                      isMobile
                        ? `${((value / totalValue) * 100).toFixed(1)}%`
                        : `${name} ${((value / totalValue) * 100).toFixed(1)}%`
                    }
                    isAnimationActive={false}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        pointerEvents="none"
                      />
                    ))}
                  </Pie>
                  {isMobile && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard2
