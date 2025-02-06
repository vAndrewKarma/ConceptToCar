import './login.css'
import './email-verification.css'
import { Typewriter } from 'react-simple-typewriter'

function EmailVerification() {
  return (
    <div
      className="color-overlay d-flex justify-content-center align-items-center"
      style={{ fontSize: '48px', color: 'white', textAlign: 'center' }}
    >
      <div className="small-devices">
        <span>
          <Typewriter
            words={['Your email has been successfully verified.']}
            loop={1}
            cursor={false}
            cursorStyle="|"
            typeSpeed={50}
            delaySpeed={3000}
          ></Typewriter>
        </span>
      </div>
    </div>
  )
}

export default EmailVerification
