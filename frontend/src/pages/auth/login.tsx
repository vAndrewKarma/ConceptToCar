import './login.css'
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { z, ZodType } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type FormData = {
  email: string
  password: string
}

function Login() {
  const schema: ZodType<FormData> = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .max(16, { message: 'Password must not exceed 16 characters.' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter.',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character.',
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
              <br />
              <Form.Label className="extra">
                Please enter your details
              </Form.Label>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="custom-label">Email Address</Form.Label>

                <Form.Control
                  className="cb-b"
                  type="email"
                  placeholder="Enter Email"
                  {...register('email')}
                />

                {errors.email && (
                  <span className="error-message"> {errors.email.message}</span>
                )}
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
                      Between 8-16, 1 upper, 1 number, 1 special character.
                    </Tooltip>
                  }
                >
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    {...register('password')}
                  />
                </OverlayTrigger>
                {errors.password && (
                  <span className="error-message">
                    {' '}
                    {errors.password.message}
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
