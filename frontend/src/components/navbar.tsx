import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Dropdown from 'react-bootstrap/Dropdown'
import './navbar.css'
import { useAuthContext } from '../contexts/useAuthcontext'

const NavScroll: React.FC = () => {
  const navbarRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const auth = useAuthContext()

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

  const handleLogout = () => {
    closeNavbar()
    auth.logout()
  }

  return (
    <Navbar
      expand="lg"
      className="navbar bg-body-tertiary"
      data-bs-theme="dark"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          ConceptToCarz
        </Navbar.Brand>
        <Navbar.Toggle ref={toggleRef} aria-controls="navbarScroll" />
        <Navbar.Collapse ref={navbarRef} id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0">
            <Nav.Link as={Link} to="/" onClick={closeNavbar}>
              Home
            </Nav.Link>
            {auth?.data?.auth ? (
              <>
                <Nav.Link as={Link} to="/dashboard" onClick={closeNavbar}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/products" onClick={closeNavbar}>
                  Products
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={closeNavbar}>
                  Contact
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/sign-in" onClick={closeNavbar}>
                  Sign In
                </Nav.Link>
                <Nav.Link as={Link} to="/sign-up" onClick={closeNavbar}>
                  Sign Up
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={closeNavbar}>
                  Contact
                </Nav.Link>
              </>
            )}
          </Nav>
          {auth?.data?.auth && (
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="dark"
                  id="dropdown-basic"
                  style={{ color: '#d1d5db' }}
                >
                  Account
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile" onClick={closeNavbar}>
                    Profile
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavScroll
