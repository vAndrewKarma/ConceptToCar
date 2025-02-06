import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/Dropdown'
import { z, ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import useAxios from 'axios-hooks'
import './login.css'
import './sign-up.css'

function SignUp() {
  const [selectedRole, setSelectedRole] = useState('Roles')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [consoleMessage, setConsoleMessage] = useState<{
    type: string
    text: string
  } | null>(null)

  const [, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/auth/register',
      method: 'POST',
    },
    { manual: true }
  )

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    setRoleError(null)
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  type FormData = {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    key: string
  }

  const schema: ZodType<FormData> = z
    .object({
      email: z
        .string()
        .nonempty({ message: 'Please enter your email address' })
        .email(),
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
      firstName: z
        .string()
        .nonempty({ message: 'Please enter your first name' })
        .max(30, { message: 'First name is too long' })
        .regex(
          /^[a-zA-Z\s]+$/,
          'First name must not contain special characters or numbers.'
        ),
      lastName: z
        .string()
        .nonempty({ message: 'Please enter your last name' })
        .max(30, { message: 'Last name is too long' })
        .regex(
          /^[a-zA-Z\s]+$/,
          'Last name must not contain special characters or numbers.'
        ),
      key: z
        .string()
        .nonempty({ message: 'Please enter your access key' })
        .min(64, 'Access key is too short (64 chr.)')
        .max(64, 'Access key is too long (64 chr.)'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  const karmalerezolva = async (
    data: FormData,
    context: object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any
  ) => {
    console.log('test')
    if (selectedRole === 'Roles') {
      setRoleError('Please select a role.')
      console.log('🔴 Role error set:', roleError)
    }
    const result = await zodResolver(schema)(data, context, options)
    return result
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: karmalerezolva,
  })

  const submitData = async (data: FormData) => {
    const sData = { ...data, role: selectedRole }
    try {
      const response = await execute({ data: sData })
      if (response?.data) {
        console.log('Success:', response.data)
        setConsoleMessage({
          type: 'success',
          text: 'Check your email for validation.',
        })
        return { success: true, data: response.data }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response) {
        const responseData = err.response.data
        let errorMessage = 'An error occurred. Please try again later.'

        if (responseData.errors && Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((e: any) => e.message)
            .join(', ')
        } else if (responseData.message) {
          errorMessage = responseData.message
        }

        setConsoleMessage({ type: 'error', text: errorMessage })
        console.error('Error:', errorMessage)
      }
    }
    console.log('✅ Form submitted with:', { ...data, role: selectedRole })
  }
  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <div className="scrollable-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6 col-lg-5">
              <Form
                className="rounded p-4 p-sm-3"
                onSubmit={handleSubmit(submitData)}
                noValidate
              >
                <div className="d-flex justify-content-center">
                  <Form.Label className="custom-title">Sign Up</Form.Label>
                </div>
                <div className="row" style={{ paddingTop: '30px' }}>
                  <div className="col-6">
                    <Form.Group className="mb-3" controlId="formBasicName">
                      <Form.Label className="custom-label">
                        First name
                      </Form.Label>
                      <Form.Control
                        className="cb-b"
                        type="text"
                        isInvalid={!!errors.firstName}
                        {...register('firstName')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>

                  <div className="col-6">
                    <Form.Group className="mb-3" controlId="formBasicSurname">
                      <Form.Label className="custom-label">
                        Last name
                      </Form.Label>
                      <Form.Control
                        className="cb-b"
                        type="text"
                        isInvalid={!!errors.lastName}
                        {...register('lastName')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="custom-label">
                    Email Address
                  </Form.Label>

                  <Form.Control
                    className="cb-b"
                    type="email"
                    isInvalid={!!errors.email}
                    {...register('email')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="row">
                  <div className="col-6">
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label className="custom-label">Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          className={`cb-b ${errors.password ? 'custom-error-border' : ''}`}
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
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
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
                  </div>

                  <div className="col-6">
                    <Form.Group
                      className="mb-3"
                      controlId="formBasicConfirmPassword"
                    >
                      <Form.Label className="custom-label">
                        Confirm Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          className={`cb-b ${errors.confirmPassword ? 'custom-error-border' : ''}`}
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
                          className="text-danger mt-1 cb-b "
                          style={{ fontSize: '13px' }}
                        >
                          {errors.confirmPassword.message}
                        </div>
                      )}
                    </Form.Group>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6" style={{ paddingTop: '20px' }}>
                    <Dropdown>
                      <Dropdown.Toggle
                        id="dropdown-autoclose-true"
                        className="w-75 btn-warning"
                        style={{ fontWeight: 'bold' }}
                      >
                        {selectedRole}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleRoleSelect('Admin')}
                        >
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
                        <Dropdown.Item
                          onClick={() => handleRoleSelect('Seller')}
                        >
                          Seller
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {roleError && (
                      <div
                        className="text-danger mt-1 cb-b"
                        style={{ fontSize: '13px' }}
                      >
                        {roleError}
                      </div>
                    )}
                  </div>

                  <div className="col-6">
                    <Form.Group className="mb-3" controlId="formBasicAdmin">
                      <Form.Label className="custom-label">
                        Access Key
                      </Form.Label>
                      <Form.Control
                        className="cb-b"
                        style={{ fontSize: '13px' }}
                        type="text"
                        isInvalid={!!errors.key}
                        {...register('key')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.key?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>
                {consoleMessage && (
                  <div
                    className={`mt-1 p-2 text-center  ${
                      consoleMessage.type === 'success'
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                    style={{
                      border: '1px solid',
                      borderRadius: '4px',
                      marginBottom: '16px',
                    }}
                  >
                    {consoleMessage.text}
                  </div>
                )}
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
    </div>
  )
}

export default SignUp
