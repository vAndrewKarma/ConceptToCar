/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Image, Button, Alert } from 'react-bootstrap'
import '../auth/login.css'
import profile from '../../assets/profile.png'
import './profile.css'
import { useAuth } from '../../hook/useAuth'
import { useState } from 'react'
import axios from 'axios'

function Profile() {
  const auth = useAuth()
  const firstName = auth.data?.session?.firstName
  const verified = auth.data?.session?.verified
  const lastName = auth.data?.session?.lastName
  const email = auth.data?.session?.email
  const role = auth.data?.session?.role
  const sdate = new Date(auth.data?.session?.createdAt)

  const date = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(sdate)

  const [isVerifyDisabled, setIsVerifyDisabled] = useState(false)
  const [isResetDisabled, setIsResetDisabled] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState('success')

  const handleButtonClick = async (type: any) => {
    if (type === 'verify') {
      setIsVerifyDisabled(true)
      try {
        await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/request-verification',
          { email: auth.data?.session?.email },
          { withCredentials: true }
        )
        setAlertMessage('Verification email sent.')
        setAlertVariant('success')
      } catch (error: any) {
        setAlertMessage(
          error.response?.data?.message || 'Error sending verification email'
        )
        setAlertVariant('danger')
      }
      setTimeout(() => setIsVerifyDisabled(false), 120000)
    } else if (type === 'reset') {
      setIsResetDisabled(true)
      try {
        await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/request-password-change',
          { email: auth.data?.session?.email },
          { withCredentials: true }
        )
        setAlertMessage(
          'A password reset email has been sent. Please check your inbox.'
        )
        setAlertVariant('success')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setAlertMessage(
          error.response?.data?.message || 'Error sending password reset email'
        )
        setAlertVariant('danger')
      }
      setTimeout(() => setIsResetDisabled(false), 120000)
    }
  }

  return (
    <div
      className="color-overlay d-flex justify-content-center align-items-center profile"
      style={{ paddingTop: '30px' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div
            className="col-12 col-md-6 col-lg-5"
            style={{ minWidth: '300px', width: 'auto' }}
          >
            <Form className="rounded p-4 p-sm-3 d-flex flex-column align-items-center">
              <div
                className="d-flex justify-content-center"
                style={{ marginBottom: '5px' }}
              >
                <Image
                  src={profile}
                  fluid
                  style={{
                    width: '180px',
                    height: '180px',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>

              <div
                className="flex-grow-1 d-flex flex-column align-items-start"
                style={{ marginTop: '0px', fontSize: '18px' }}
              >
                <div
                  className="d-flex justify-content-start gap-3"
                  style={{
                    whiteSpace: 'nowrap',
                    minWidth: '100%',
                    lineHeight: '1.5',
                    marginTop: '-10px',
                  }}
                >
                  <span>
                    <strong>First Name:</strong> {firstName}
                  </span>
                  <span>
                    <strong>Last Name:</strong> {lastName}
                  </span>
                </div>
                <span style={{ paddingTop: '10px', lineHeight: '1.5' }}>
                  <strong>Email:</strong> {email}
                </span>
                <span style={{ paddingTop: '10px', lineHeight: '1.5' }}>
                  <strong>Role:</strong> {role}
                </span>
                <span style={{ paddingTop: '10px', lineHeight: '1.5' }}>
                  <strong>Email status:</strong>{' '}
                  {verified ? 'Verified' : 'Not Verified'}
                </span>
                <span style={{ paddingTop: '10px', lineHeight: '1.5' }}>
                  <strong>Join Date:</strong> {date}
                </span>
                <div className="d-flex justify-content-between align-items-center w-100">
                  {!verified && (
                    <Button
                      variant="dark"
                      className="mt-3"
                      onClick={() => handleButtonClick('verify')}
                      disabled={isVerifyDisabled}
                    >
                      {isVerifyDisabled
                        ? 'Sending verification...'
                        : 'Verify Email'}
                    </Button>
                  )}

                  <Button
                    variant="dark"
                    className="mt-3 ms-auto"
                    onClick={() => handleButtonClick('reset')}
                    disabled={isResetDisabled}
                  >
                    {isResetDisabled
                      ? 'Sending reset email...'
                      : 'Reset Password'}
                  </Button>
                </div>
              </div>
              {alertMessage && (
                <Alert
                  variant={alertVariant}
                  className="mt-3 w-100 text-center"
                >
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

export default Profile
