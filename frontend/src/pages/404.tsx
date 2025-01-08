import { Component } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './auth/login.css'
import './styles.css'

export default class PageNotFound extends Component {
  render() {
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6 col-lg-5">
              <Form className="rounded p-4 p-sm-3">
                <div className="d-flex justify-content-center">
                  <Form.Label
                    className="font"
                    style={{
                      fontSize: '48px',
                      color: 'red',
                      fontWeight: '600',
                    }}
                  >
                    Error 404
                  </Form.Label>
                </div>

                <div className="d-flex justify-content-center">
                  <Form.Label
                    className="font"
                    style={{ fontSize: '24px', fontWeight: '600' }}
                  >
                    Oops! The page can't be found.
                  </Form.Label>
                </div>
                <div className="gif-container">
                  <img
                    src="https://media.giphy.com/media/1MZeQmU4RveBC2qQSn/giphy.gif"
                    alt="GIF Animation"
                    className="responsive-gif img-fluid"
                  />
                </div>
                <div
                  className="d-flex justify-content-center"
                  style={{ paddingTop: '20px' }}
                >
                  <Link to="/">
                    <Button className="custom-button font" variant="dark">
                      Home
                    </Button>
                  </Link>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
