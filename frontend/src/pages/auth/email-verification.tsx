import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typewriter } from 'react-simple-typewriter'
import './login.css'
import './email-verification.css'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'

function EmailVerification() {
  const queryClient = useQueryClient()

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

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post(
          'https://backend-tests.conceptocar.xyz/auth/verify-email',

          { code },
          { withCredentials: true }
        )

        if (response.status !== 200) {
          throw new Error(response.data.error || 'Verification failed')
        }

        setState((s) => ({ ...s, loading: false, success: true }))

        queryClient.removeQueries({ queryKey: ['authUser'] })
        localStorage.removeItem('authUser')

        window.location.replace('/sign-in')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err)
        setState((s) => ({
          ...s,
          loading: false,
          error: err.response.data.message,
        }))
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
            <span style={{ fontSize: '48px', color: '#fff' }}>
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
            <h1 style={{ color: '#fff' }}>Email Verification Failed</h1>

            <div className="resend-section">
              {state.error && <h2 className="error-message">{state.error}</h2>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
