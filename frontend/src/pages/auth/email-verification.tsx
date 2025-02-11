import './login.css'
import './email-verification.css'
import { Typewriter } from 'react-simple-typewriter'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
function EmailVerification() {
  const { id } = useParams()
  const [isOk, setIsOk] = useState<boolean>(false)

  useEffect(() => {
    console.log(id)
    if (id?.length === 64) {
      setIsOk(true)
    } else {
      setIsOk(false)
    }
  }, [])

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
