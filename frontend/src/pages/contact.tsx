import { Component } from 'react'
import { Image, Container, Row, Col } from 'react-bootstrap'
import { FaGithub, FaLinkedin, FaDiscord, FaInstagram } from 'react-icons/fa'
import './auth/login.css'
import './styles.css'
import './contact.css'
import iustin from '../assets/contact-iustin.png'
import andrei from '../assets/contact-andrei.png'
import nicola from '../assets/contact-nicola.png'

export default class Contact extends Component {
  render() {
    return (
      <div className="color-overlay color-overlay d-flex justify-content-center align-items-center">
        <div className="scrollable-content">
          <Container className="text-center mt-5">
            <Row className="justify-content-center">
              <Col xs={12} md={3} className="mb-4">
                <Image
                  src={andrei}
                  roundedCircle
                  fluid
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                  }}
                />
                <p className="contact">Vătășelu Andrei</p>
                <div>
                  <a
                    href="https://github.com/vAndrewKarma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaGithub size={36} />
                  </a>
                  <a
                    href="https://discord.com/users/294857425922555905"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaDiscord size={36} />
                  </a>
                  <a
                    href="https://www.instagram.com/karma.andrew16/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaInstagram size={36} />
                  </a>
                </div>
              </Col>

              <Col xs={12} md={3} className="mb-4">
                <Image
                  src={iustin}
                  roundedCircle
                  fluid
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                  }}
                />
                <p className="contact">Stanciu Iustin</p>
                <div>
                  <a
                    href="https://github.com/YouSteen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaGithub size={36} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/iustin-stanciu-a3b087273/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaLinkedin size={36} />
                  </a>
                  <a
                    href="https://www.instagram.com/iustin.mihai.17/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaInstagram size={36} />
                  </a>
                </div>
              </Col>

              <Col xs={12} md={3} className="mb-4">
                <Image
                  src={nicola}
                  roundedCircle
                  fluid
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                  }}
                />
                <p className="contact">Sincaru Nicola</p>
                <div>
                  <a
                    href="https://github.com/Nana-2237"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaGithub size={36} />
                  </a>
                  <a
                    href="https://discord.com/users/689772034271477762"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaDiscord size={36} />
                  </a>
                  <a
                    href="https://www.instagram.com/nicola_diana37/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-2"
                  >
                    <FaInstagram size={36} />
                  </a>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    )
  }
}
