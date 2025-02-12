import './login.css'
import { Form, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { z, ZodType } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import useAxios from 'axios-hooks'
type FormData = {
  email: string
  password: string
}
const generateCodeVerifier = (length: number): string => {
  const allowedChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomArray = new Uint8Array(length)
  crypto.getRandomValues(randomArray)
  return Array.from(
    randomArray,
    (byte) => allowedChars[byte % allowedChars.length]
  ).join('')
}

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function Login() {
  const [error, setError] = useState<string | null>(null)
  const [, executeInit] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/auth/initiate_login',
      method: 'POST',
    },
    { manual: true }
  )
  const [, executeLogin] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/auth/login',
      method: 'POST',
    },
    { manual: true }
  )
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
  const submitData = async (data: FormData) => {
    try {
      setError(null)

      // Generate PKCE code verifier and challenge
      const code_verifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(code_verifier)
      const res = await executeInit({
        data: { challenge },
        withCredentials: true,
      })
      const loginreqid = res.data.id

      await executeLogin({
        data: {
          email: data.email,
          password: data.password,
          loginReqId: loginreqid,
          code_verifier,
          rememberMe: true,
        },
        withCredentials: true,
      })
      window.location.reload()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message)
    }
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
              {error && <div className="error-message">{error}</div>}
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
