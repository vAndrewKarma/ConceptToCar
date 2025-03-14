import React, { useState } from 'react'
import { Form, Button, Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'

const RequestNewPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await axios.post(
        'https://backend-tests.conceptocar.xyz/auth/request-password-change',
        {
          email: email,
        },
        {
          withCredentials: true,
        }
      )
      setMessage(response.data.message)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={5}>
            <Form
              className="rounded p-4 p-sm-3"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="d-flex justify-content-center">
                <Form.Label className="custom-title">
                  Request New Password
                </Form.Label>
              </div>
              <Form.Label className="extra">
                Enter your email to receive a password reset link
              </Form.Label>

              <Form.Group className="mb-3" controlId="formNewPasswordEmail">
                <Form.Label className="custom-label">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-center">
                <Button
                  className="custom-button"
                  variant="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
              {message && <div className="error-message mt-3">{message}</div>}

              <div className="mt-3 text-center">
                <Link to="/sign-in">Back to Login</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default RequestNewPassword
