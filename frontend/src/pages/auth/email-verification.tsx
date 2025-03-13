import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typewriter } from 'react-simple-typewriter'
import './login.css'
import './email-verification.css'
import axios from 'axios'

function EmailVerification() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<{
    loading: boolean
    success: boolean
    error: string | null
    resending: boolean
    resent: boolean
  }>({
    loading: true,
    success: false,
    error: null,
    resending: false,
    resent: false,
  })

  // Handle email verification
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/verify-email',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          }
        )

        if (response.status !== 200) {
          throw new Error(response.data.error || 'Verification failed')
        }

        setState((s) => ({ ...s, loading: false, success: true }))

        setTimeout(() => navigate('/dashboard'), 3000)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setState((s) => ({ ...s, loading: false, error: err.message }))
      }
    }

    if (code) verifyEmail()
  }, [code, navigate])

  return (
    <div className="color-overlay d-flex justify-content-center align-items-center">
      <div className="verification-container small-devices">
        {state.loading ? (
          <div className="verification-status">
            <span style={{ fontSize: '32px', color: '#fff' }}>
              <Typewriter
                words={['Verifying your email...']}
                loop={1}
                cursor={false}
                typeSpeed={50}
              />
            </span>
          </div>
        ) : state.success ? (
          <div className="verification-success">
            <span style={{ fontSize: '48px' }}>
              <Typewriter
                words={['Your email has been successfully verified!']}
                loop={1}
                cursor={false}
                typeSpeed={50}
              />
            </span>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="verification-error">
            <h2 style={{ color: '#fff' }}>Email Verification Failed</h2>

            <div className="resend-section">
              {state.error && <p className="error-message">{state.error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
