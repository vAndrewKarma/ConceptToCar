import { Form, Image, Button } from 'react-bootstrap'
import '../auth/login.css'
import profile from '../../assets/profile.png'
import './profile.css'

import { useState } from 'react'

function Profile() {
  const firstName = 'Stanciu'
  const lastName = 'Iustin'
  const email = 'stanciu_iustin@yahoo.com'
  const role = 'Admin'
  const date = '2025-01-30'

  const [isVerifyDisabled, setIsVerifyDisabled] = useState(false)
  const [isResetDisabled, setIsResetDisabled] = useState(false)

  const handleButtonClick = (type: string) => {
    if (type === 'verify') {
      setIsVerifyDisabled(true)
      setTimeout(() => setIsVerifyDisabled(false), 120000)
    } else if (type === 'reset') {
      setIsResetDisabled(true)
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
                className="flex-grow-1 d-flex flex-column align-items-start "
                style={{ marginTop: '0px', fontSize: '18px' }}
              >
                <div
                  className="d-flex justify-content-start gap-3 "
                  style={{
                    whiteSpace: 'nowrap',
                    minWidth: '100%',
                    lineHeight: '1.5',
                    marginTop: '-10px',
                  }}
                >
                  <span className="border-bot">
                    <strong>First Name:</strong> {firstName}
                  </span>
                  <span className="border-bot">
                    <strong>Last Name:</strong> {lastName}
                  </span>
                </div>
                <span
                  className="border-bot"
                  style={{ paddingTop: '10px', lineHeight: '1.5' }}
                >
                  <strong>Email:</strong> {email}
                </span>
                <span
                  className="border-bot"
                  style={{ paddingTop: '10px', lineHeight: '1.5' }}
                >
                  <strong>Role:</strong> {role}
                </span>
                <span
                  className="border-bot"
                  style={{ paddingTop: '10px', lineHeight: '1.5' }}
                >
                  <strong>Join Date:</strong> {date}
                </span>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <Button
                    variant="dark"
                    className="mt-3"
                    onClick={() => handleButtonClick('verify')}
                    disabled={isVerifyDisabled}
                  >
                    {isVerifyDisabled ? 'Please wait...' : 'Verify Email'}
                  </Button>
                  <Button
                    variant="dark"
                    className="mt-3 ms-auto"
                    onClick={() => handleButtonClick('reset')}
                    disabled={isResetDisabled}
                  >
                    {isResetDisabled ? 'Please wait...' : 'Reset Password'}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
