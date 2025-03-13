import { Component } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import './auth/login.css'
import './styles.css'
import './home.css'
import logo from '../assets/logo.png'

export default class Home extends Component {
  render() {
    return (
      <div className="color-overlay d-flex justify-content-center ">
        <div className="d-flex justify-content-center align-items-center">
          <img src={logo} alt="ConceptToCar Logo" className="home-logo" />
        </div>
        <div className="home d-flex justify-content-center align-items-center">
          <div className="typewriter">
            <Typewriter
              words={[
                'Design. Innovate. Drive.',
                'Turning Concepts into Reality.',
                'Where Ideas Meet the Road.',
              ]}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={50}
              delaySpeed={3000}
            />
          </div>
        </div>
      </div>
    )
  }
}
