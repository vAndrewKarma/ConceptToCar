import './login.css'
import { Form, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { z, ZodType } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

type FormData = {
  email: string
  password: string
}

function Login() {
  const schema: ZodType<FormData> = z.object({
    email: z.string().email({ message: 'Invalid credentials' }),
    password: z
      .string()
      .nonempty({ message: 'Invalid credentials' })
      .min(8, { message: 'Invalid credentials' })
      .max(16, { message: 'Invalid credentials' })
      .regex(/[A-Z]/, {
        message: 'Invalid credentials',
      })
      .regex(/[0-9]/, { message: 'Invalid credentials' })
      .regex(/[\W_]/, {
        message: 'Invalid credentials',
      }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const submitData = (data: FormData) => {
    console.log('it worked', data)
  }

  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <Form
              className="rounded p-4 p-sm-3"
              onSubmit={handleSubmit(submitData)}
              noValidate
            >
              <div className="d-flex justify-content-center">
                <Form.Label className="custom-title">Welcome back</Form.Label>
              </div>
              <Form.Label className="extra">
                Please enter your details
              </Form.Label>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="custom-label">Email Address</Form.Label>

                <Form.Control
                  className="cb-b"
                  type="email"
                  placeholder="Enter Email"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="custom-label">Password</Form.Label>
                  <Form.Label
                    className="text-right cb-b"
                    style={{ fontSize: '12px' }}
                  >
                    <Link to="/recover"> Forgot password?</Link>
                  </Form.Label>
                </div>
                {/* <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Between 8-16, 1 upper, 1 number, 1 special character.
                    </Tooltip>
                  }
                > */}
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  isInvalid={!!errors.password}
                  {...register('password')}
                />
                {/* </OverlayTrigger> */}

                {(errors.password || errors.email) && (
                  <span className="error-message">
                    {errors.password?.message || errors.email?.message}
                  </span>
                )}
              </Form.Group>

              <Form.Group className="mb-3 cb-b" controlId="formBasicCheckbox">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="Remember Me"
                    style={{ fontSize: '12px' }}
                  />
                  <Form.Label className="extra cb-b">
                    Don't have an account? <Link to="/sign-up">Sign up</Link>
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
