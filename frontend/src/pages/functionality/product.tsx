import { Form, Button, Modal } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAxios from 'axios-hooks'
import './product.css'
import '../auth/login.css'
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0) + word.slice(1))
    .join(' ')
}
function Product() {
  const { name: productName } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  const [{ loading, error }, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/get-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

  const [product, setProduct] = useState(null)

  useEffect(() => {
    const pname = productName ? unslugify(productName) : ''
    if (pname) {
      execute({ data: { name: pname } })
        .then((response) => {
          if (response.data) {
            setProduct(response.data)
          }
        })
        .catch(() => {})
    }
  }, [productName, execute])

  if (loading)
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        Loading...
      </div>
    )
  if (error)
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        Error: {error.response?.data?.message || error.message}
      </div>
    )

  const defaultProduct = {
    id: '1',
    name: 'Wheel',
    description:
      "A wheel is a crucial component of a vehicle's mobility and steering system. It provides the necessary contact with the road, ensuring traction, stability, and smooth movement. In the steering mechanism, the front wheels pivot to change the vehicle’s direction, guided by the steering system.",
    stage: 'Concept',
    estimated_weight: '5',
    weight_unit: 'kg',
    estimated_height: '60',
    height_unit: 'cm',
    estimated_width: '32',
    width_unit: 'cm',
    createdBy: 'Stanciu Iustin',
    created_at: '18.02.2025',
    updated_at: '20.02.2025',
  }

  const displayProduct = product || defaultProduct

  return (
    <>
      <div className="color-overlay d-flex justify-content-center align-items-center scroll">
        <div className="scrollable-container">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-6 col-lg-7">
                <Form className="rounded p-4 p-sm-3 bg-dark">
                  <div className="d-flex justify-content-center">
                    <Form.Label
                      style={{
                        fontSize: '36px',
                        color: 'white',
                        fontWeight: '600',
                      }}
                    >
                      Product {displayProduct.id}
                    </Form.Label>
                  </div>
                  <div className="d-flex flex-column justify-content-start style">
                    <span>
                      <strong>Name:</strong> {displayProduct.name}
                    </span>
                    <span className="pad">
                      <strong>Description:</strong> {displayProduct.description}
                    </span>
                    <span className="pad">
                      <strong>Stage:</strong> {displayProduct.stage}
                    </span>
                    <span className="pad">
                      <strong>Estimated weight:</strong>{' '}
                      {displayProduct.estimated_weight}{' '}
                      {displayProduct.weight_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimated height:</strong>{' '}
                      {displayProduct.estimated_height}{' '}
                      {displayProduct.height_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimated width:</strong>{' '}
                      {displayProduct.estimated_width}{' '}
                      {displayProduct.width_unit}
                    </span>
                    <span className="pad">
                      <strong>Created By:</strong> {displayProduct.createdBy}
                    </span>
                    <span className="pad">
                      <strong>Created at:</strong>{' '}
                      {new Date(displayProduct.created_at).toLocaleDateString()}{' '}
                      at{' '}
                      {new Date(displayProduct.created_at).toLocaleTimeString()}
                    </span>
                    <span className="pad">
                      <strong>Updated at:</strong>{' '}
                      {new Date(displayProduct.updated_at).toLocaleDateString()}{' '}
                      at{' '}
                      {new Date(displayProduct.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center phone"
                    style={{ paddingTop: '15px' }}
                  >
                    <Button className="btn btn-warning">Modify</Button>
                    <Button
                      onClick={() => navigate('/materials')}
                      className="btn btn-warning"
                    >
                      Materials
                    </Button>
                    <Button
                      onClick={() => navigate('/gallery')}
                      className="btn btn-warning"
                    >
                      Go to gallery
                    </Button>
                    <Button className="btn btn-danger" onClick={handleShow}>
                      Delete
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={handleClose}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" id="confirmDelete">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Product
