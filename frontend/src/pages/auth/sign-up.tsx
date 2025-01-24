import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/Dropdown'
import './login.css'

function SignUp() {
  const [selectedRole, setSelectedRole] = useState('Roles')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <Form className="rounded p-4 p-sm-3" noValidate>
              <div className="d-flex justify-content-center">
                <Form.Label className="custom-title">Sign Up</Form.Label>
              </div>
              <div className="row" style={{ paddingTop: '30px' }}>
                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label className="custom-label">
                      First name <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control className="cb-b" type="text" />
                  </Form.Group>
                </div>

                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicSurname">
                    <Form.Label className="custom-label">
                      Last name <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control className="cb-b" type="text" />
                  </Form.Group>
                </div>
              </div>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="custom-label">
                  Email Address <span style={{ color: 'red' }}>*</span>
                </Form.Label>

                <Form.Control
                  className="cb-b"
                  type="email"
                  placeholder="Enter Email"
                />
              </Form.Group>
              <div className="row">
                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className="custom-label">
                      Password <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control className="cb-b" type="text" />
                  </Form.Group>
                </div>

                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className="custom-label">
                      Confirm Password <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control className="cb-b" type="text" />
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-autoclose-true"
                      className="w-75 btn-warning"
                      style={{ fontWeight: 'bold' }}
                    >
                      {selectedRole}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleRoleSelect('Admin')}>
                        Admin
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleRoleSelect('Designer')}
                      >
                        Designer
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleRoleSelect('Portofolio manager')}
                      >
                        Portofolio manager
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleSelect('Seller')}>
                        Seller
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Form.Label
                    className="extra"
                    style={{ fontSize: '14px', paddingTop: '5px' }}
                  >
                    **Notice: The fields marked with "
                    <span style={{ color: 'red' }}>*</span>" are mandatory
                  </Form.Label>
                </div>
                {selectedRole === 'Admin' && (
                  <div className="col-6">
                    <Form.Group className="mb-3" controlId="formBasicAdmin">
                      <Form.Label className="custom-label">
                        Admin Key
                      </Form.Label>
                      <Form.Control className="cb-b" type="text" />
                    </Form.Group>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-center cb-b">
                <Button
                  className="custom-button"
                  variant="primary"
                  type="submit"
                >
                  Sign Up
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
