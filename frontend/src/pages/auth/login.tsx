import './login.css'
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

function Login() {
  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <Form className="rounded p-4 p-sm-3">
              <div className="d-flex justify-content-center">
                <Form.Label className="custom-title">Welcome back</Form.Label>
              </div>
              <br />
              <Form.Label className="extra">
                Please enter your details
              </Form.Label>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="custom-label">Email Address</Form.Label>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Enter a valid email address.</Tooltip>}
                >
                  <Form.Control type="email" placeholder="Enter Email" />
                </OverlayTrigger>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="custom-label">Password</Form.Label>
                  <Form.Label
                    className="text-right cb-b"
                    style={{ fontSize: '12px' }}
                  >
                    <a href="d"> Forgot password?</a>
                  </Form.Label>
                </div>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Password must be 8-16 characters long and contain one
                      uppercase and one special character.
                    </Tooltip>
                  }
                >
                  <Form.Control type="password" placeholder="Enter Password" />
                </OverlayTrigger>
              </Form.Group>

              <Form.Group className="mb-3 cb-b" controlId="formBasicCheckbox">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="Remember Me"
                    style={{ fontSize: '12px' }}
                  />
                  <Form.Label className="extra">
                    Don't have an account? <a href="d">Sign up</a>
                  </Form.Label>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-center cb-b">
                <Button
                  className="custom-button"
                  variant="primary"
                  type="submit"
                >
                  Log In
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
