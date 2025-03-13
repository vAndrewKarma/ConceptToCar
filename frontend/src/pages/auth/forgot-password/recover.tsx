/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { z, ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'

import '../login.css'

function NewPassword() {
  // Extract the verification code from the URL
  const { code } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isLinkValid, setIsLinkValid] = useState(false)
  const [loading, setLoading] = useState(true)

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  type FormData = {
    password: string
    confirmPassword: string
  }

  const schema: ZodType<FormData> = z
    .object({
      password: z
        .string()
        .nonempty({ message: 'Please enter your password' })
        .min(8, { message: 'Password too short (min. 8 chr.)' })
        .max(16, { message: 'Too many characters (max. 16 chr.)' })
        .regex(/[A-Z]/, {
          message: 'You must have at least one uppercase character',
        })
        .regex(/[0-9]/, { message: 'You must have at least one number' })
        .regex(/[\W_]/, {
          message: 'You must have at least one special character',
        }),
      confirmPassword: z
        .string()
        .nonempty({ message: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Verify that the link is valid using the verify-password-change endpoint
  useEffect(() => {
    async function verifyLink() {
      try {
        await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/verify-password-change',
          { code },
          { withCredentials: true }
        )
        setIsLinkValid(true)
        setMessage('')
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Invalid or expired link.')
        setIsLinkValid(false)
      } finally {
        setLoading(false)
      }
    }
    if (code) {
      verifyLink()
    } else {
      setLoading(false)
      setMessage('No code provided.')
    }
  }, [code])

  const submitData = async (data: FormData) => {
    try {
      // Call your change-password endpoint with the code and new password
      const response = await axios.post(
        'https://backend-tests.conceptocar.xyz/auth/change-password',
        {
          code, // from the URL parameter
          newPassword: data.password,
        },
        { withCredentials: true }
      )
      setMessage(response.data.message)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error changing password')
    }
  }

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>
  }

  if (!isLinkValid) {
    return <div className="text-center mt-5">{message}</div>
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
                <Form.Label
                  className="font title"
                  style={{
                    fontSize: '30px',
                    fontWeight: '600',
                  }}
                >
                  Set a new password
                </Form.Label>
              </div>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <div
                  className="d-flex justify-content"
                  style={{ paddingTop: '10px' }}
                >
                  <Form.Label className="custom-label">New Password</Form.Label>
                </div>
                <div className="position-relative">
                  <Form.Control
                    className={`cb-b ${
                      errors.password ? 'custom-error-border' : ''
                    }`}
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    style={{
                      paddingRight: '50px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    style={{ color: 'black' }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {errors.password && (
                  <div
                    className="text-danger mt-1 cb-b small"
                    style={{ fontSize: '13px' }}
                  >
                    {errors.password.message}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                <div className="d-flex justify-content">
                  <Form.Label className="custom-label">
                    Confirm Password
                  </Form.Label>
                </div>
                <div className="position-relative">
                  <Form.Control
                    className={`cb-b ${
                      errors.confirmPassword ? 'custom-error-border' : ''
                    }`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    style={{
                      paddingRight: '50px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    style={{ color: 'black' }}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div
                    className="text-danger mt-1 cb-b"
                    style={{ fontSize: '13px' }}
                  >
                    {errors.confirmPassword.message}
                  </div>
                )}
              </Form.Group>

              <div className="d-flex justify-content-center cb-b">
                <Button
                  variant="primary"
                  type="submit"
                  style={{ width: '200px' }}
                >
                  Change Password
                </Button>
              </div>
              {message && <div className="text-center mt-3">{message}</div>}
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPassword
