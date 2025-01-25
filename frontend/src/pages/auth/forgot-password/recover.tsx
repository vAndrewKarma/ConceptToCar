import { Form, Button } from 'react-bootstrap'
import { z, ZodType } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import '../login.css'
import '../../styles.css'
import './recover.css'

type FormData = {
  email: string
}

function Recover() {
  const schema: ZodType<FormData> = z.object({
    email: z.string().email({ message: 'Invalid credentials' }),
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
                <Form.Label
                  className="font title"
                  style={{
                    fontSize: '30px',
                    fontWeight: '600',
                  }}
                >
                  Reset your password
                </Form.Label>
              </div>
              <div className="d-flex justify-content-center">
                <Form.Label
                  className="font extra"
                  style={{
                    fontSize: '16px',
                    fontWeight: '300',
                    textIndent: '1.5em',
                    textAlign: 'justify',
                  }}
                >
                  Enter your user account's verified email address and we will
                  send you a password reset link.
                </Form.Label>
              </div>
              <Form.Group
                className="mb-3"
                controlId="formBasicEmail"
                style={{ paddingTop: '10px' }}
              >
                <Form.Label className="custom-label">Email Address</Form.Label>

                <Form.Control
                  className="cb-b"
                  type="email"
                  placeholder="Enter Email"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />

                {errors.email && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="error-message"
                  >
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <div className="d-flex justify-content-center cb-b">
                <Button
                  className="custom-button"
                  variant="primary"
                  type="submit"
                >
                  Send Email
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recover
