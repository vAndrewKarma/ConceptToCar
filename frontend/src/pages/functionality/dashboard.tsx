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
import axios from 'axios'

const statsTemplate = [
  { title: 'Total Accounts', value: '10' },
  { title: 'Total Products', value: '0' },
  { title: 'Total Materials', value: '0' },
  { title: 'Growth Rate', value: '0.0%' },
]

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const currentYear = new Date().getFullYear()

const stageOrder = [
  { name: 'Concept', key: 'concept' },
  { name: 'Feasibility', key: 'feasibility' },
  { name: 'Design', key: 'design' },
  { name: 'Production', key: 'production' },
  { name: 'Withdrawal', key: 'withdrawal' },
  { name: 'StandBy', key: 'standby' },
  { name: 'Cancelled', key: 'cancelled' },
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
  const [stats, setStats] = useState(statsTemplate)
  const [barChartData, setBarChartData] = useState<
    { name: string; value: number }[]
  >([])
  const [pieChartData, setPieChartData] = useState<
    { name: string; value: number }[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          'https://backend-tests.conceptocar.xyz/auth/user-dash',
          { withCredentials: true }
        )

        const productResponse = await axios.get(
          'https://backend-tests.conceptocar.xyz/products/dashboard',
          { withCredentials: true }
        )

        const userData = userResponse.data
        const productData = productResponse.data

        const newStats = [...statsTemplate]
        newStats[0].value = userData.totalUsers.toString()
        newStats[1].value = productData.totalProducts.toString()
        newStats[2].value = productData.totalMaterials.toString()

        const monthlyData = monthOrder.map((month) => ({
          name: month,
          value:
            productData.prodbymonth.find(
              (m: { name: string }) => m.name === month
            )?.value || 0,
        }))
        setBarChartData(monthlyData)

        const currentMonthIndex = new Date().getMonth()
        const currentMonthValue = monthlyData[currentMonthIndex]?.value || 0
        const prevMonthIndex =
          currentMonthIndex > 0 ? currentMonthIndex - 1 : 11
        const prevMonthValue = monthlyData[prevMonthIndex]?.value || 0

        let growthRate = 0
        if (prevMonthValue !== 0) {
          growthRate =
            ((currentMonthValue - prevMonthValue) / prevMonthValue) * 100
        } else if (currentMonthValue > 0) {
          growthRate = 100
        }

        newStats[3].value = `${Math.abs(growthRate).toFixed(1)}% ${
          growthRate >= 0 ? '🔼' : '🔽'
        }`
        setStats(newStats)
        const stageData = stageOrder.map((stage) => ({
          name: stage.name,
          value:
            productData.productsByStage.find(
              (s: { name: string }) => s.name === stage.key
            )?.value || 0,
        }))
        setPieChartData(stageData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalValue = pieChartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="color-background scroll-container">
      <Container fluid>
        <Row className="justify-content-center" style={{ paddingTop: '80px' }}>
          {stats.map((stat, index) => (
            <Col key={index} md={3} sm={6} xs={12} className="mb-3">
              <Card className="p-3 text-center bg-dark text-light shadow-sm">
                <h6 className="stat-title">{stat.title}</h6>
                <h2 className="fw-bold stat-value">{stat.value}</h2>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="justify-content-center" style={{ paddingTop: '40px' }}>
          <Col lg={6} md={10} sm={12} xs={12} className="mb-4">
            <Card className="p-3 bg-dark text-white shadow chart-card">
              <h5 className="chart-title">Monthly Product Statistics</h5>
              <p className="chart-subtitle">All Months {currentYear}</p>
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
                <strong>
                  {stats[3].value.includes('🔼')
                    ? 'Trending up'
                    : 'Trending down'}{' '}
                  by {stats[3].value.replace('%', '')} this month{' '}
                  {stats[3].value.includes('🔼') ? '🔼' : '🔽'}
                </strong>
              </p>
            </Card>
          </Col>

          <Col lg={6} md={10} sm={12} xs={12}>
            <Card className="p-3 bg-dark text-white shadow chart-card">
              <h5 className="chart-title">Stage Statistics</h5>
              <p className="chart-subtitle">All Months {currentYear}</p>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart className="pie-font" style={{ fontSize: '16px' }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 90 : 140}
                    dataKey="value"
                    label={({ name, value }) =>
                      isMobile
                        ? `${((value / totalValue) * 100).toFixed(1)}%`
                        : `${name} ${((value / totalValue) * 100).toFixed(1)}%`
                    }
                    isAnimationActive={false}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
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
