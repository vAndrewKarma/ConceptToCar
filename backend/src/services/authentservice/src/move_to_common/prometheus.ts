import { FastifyInstance } from 'fastify'
import promclient from 'prom-client'
export default function Initprometheus(server: FastifyInstance) {
  const register = new promclient.Registry()
  promclient.collectDefaultMetrics({ register })
  const httpRequestsTotal = new promclient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status_code', 'route'],
  })

  const httpRequestDurationSeconds = new promclient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Histogram of HTTP request duration',
    labelNames: ['method', 'status_code', 'route'],
    buckets: [0.1, 0.2, 0.5, 1, 2, 3, 5, 10, 15, 30, 60],
  })

  const httpRequestErrorsTotal = new promclient.Counter({
    name: 'http_request_errors_total',
    help: 'Total number of HTTP requests that resulted in errors (4xx or 5xx)',
    labelNames: ['method', 'status_code', 'route'],
  })

  register.registerMetric(httpRequestsTotal)
  register.registerMetric(httpRequestDurationSeconds)
  register.registerMetric(httpRequestErrorsTotal)

  server.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', register.contentType)
    return register.metrics()
  })
}
