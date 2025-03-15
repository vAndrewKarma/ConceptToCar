/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { z, ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'

import './recover.css'
import { useQueryClient } from '@tanstack/react-query'

function NewPassword() {
  const queryClient = useQueryClient()
  const { code } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState<
    'success' | 'danger' | 'info'
  >('danger')
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

  useEffect(() => {
    async function verifyLink() {
      try {
        await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/verify-password-change',
          { code },
          { withCredentials: true }
        )
        setIsLinkValid(true)
        setAlertMessage('')
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error.message ||
          'Invalid or expired link.'
        setAlertMessage(errMsg)
        setAlertVariant('danger')
        setIsLinkValid(false)
      } finally {
        setLoading(false)
      }
    }
    if (code) {
      verifyLink()
    } else {
      setLoading(false)
      setAlertMessage('No code provided.')
      setAlertVariant('danger')
    }
  }, [code])

  const submitData = async (data: FormData) => {
    try {
      const response = await axios.post(
        'https://backend-tests.conceptocar.xyz/auth/change-password',
        {
          code,
          newPassword: data.password,
        },
        { withCredentials: true }
      )
      setAlertMessage(response.data.message)
      setAlertVariant('success')
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ['authUser'] })
        localStorage.removeItem('authUser')
        window.location.replace('/sign-in')
      }, 2000)
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        'Error changing password'
      setAlertMessage(errMsg)
      setAlertVariant('danger')
    }
  }

  if (loading) {
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        <div className="text-center mt-5">
          <Alert variant="info" style={{ fontSize: '24px' }}>
            Loading...
          </Alert>
        </div>
      </div>
    )
  }

  if (!isLinkValid) {
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        <div className="text-center mt-5">
          <Alert variant="danger" style={{ fontSize: '24px' }}>
            {alertMessage}
          </Alert>
        </div>
      </div>
    )
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
              {alertMessage && (
                <Alert className="mt-3 text-center" variant={alertVariant}>
                  {alertMessage}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPassword
