import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import './navbar.css'
import { useAuthContext } from '../contexts/useAuthcontext'
const NavScroll: React.FC = () => {
  const navbarRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = useAuthContext()
  console.log(auth)
  console.log(auth?.data?.auth)

  const handleClickOutside = (event: MouseEvent) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target as Node) &&
      toggleRef.current &&
      !toggleRef.current.contains(event.target as Node)
    ) {
      if (toggleRef.current.classList.contains('collapsed') === false) {
        toggleRef.current.click()
      }
    }
  }

  const closeNavbar = () => {
    if (
      toggleRef.current &&
      toggleRef.current.classList.contains('collapsed') === false
    ) {
      toggleRef.current.click()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <Navbar
      expand="lg"
      className="navbar bg-body-tertiary"
      data-bs-theme="dark"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          ConceptToCarZ
        </Navbar.Brand>
        <Navbar.Toggle ref={toggleRef} aria-controls="navbarScroll" />
        <Navbar.Collapse ref={navbarRef} id="navbarScroll">
          {!auth?.data?.auth ? (
            <Nav className="me-auto my-2 my-lg-0">
              <Nav.Link as={Link} to="/" onClick={closeNavbar}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/sign-in" onClick={closeNavbar}>
                Sign In
              </Nav.Link>
              <Nav.Link as={Link} to="/sign-up" onClick={closeNavbar}>
                Sign Up
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" onClick={closeNavbar}>
                Contact
              </Nav.Link>
            </Nav>
          ) : (
            <Nav className="me-auto my-2 my-lg-0">
              <Nav.Link as={Link} to="/" onClick={closeNavbar}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard" onClick={closeNavbar}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/products" onClick={closeNavbar}>
                Products
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" onClick={closeNavbar}>
                Contact
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavScroll
