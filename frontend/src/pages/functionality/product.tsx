import { Form, Button, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './product.css'
import '../auth/login.css'

function Product() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  const id = '1'
  const name = 'Wheel'
  const description =
    "A wheel is a crucial component of a vehicle's mobility and steering system. It provides the necessary contact with the road, ensuring traction, stability, and smooth movement. In the steering mechanism, the front wheels pivot to change the vehicle’s direction, guided by the steering system."
  const stage = 'Concept'
  const estimated_height = '60'
  const estimated_width = '32'
  const estimated_weight = '5'
  const weight_unit = 'kg'
  const width_unit = 'cm'
  const height_unit = 'cm'
  const createdBy = 'Stanciu Iustin'
  const created_at = '18.02.2025'
  const update_at = '20.02.2025'

  return (
    <>
      <div className="color-overlay d-flex justify-content-center align-items-center scroll">
        <div className="scrollable-container">
          <div className="container ">
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
                      Product {id}
                    </Form.Label>
                  </div>
                  <div className="d-flex flex-column justify-content-start style">
                    <span>
                      <strong>Name:</strong> {name}
                    </span>
                    <span className="pad">
                      <strong>Description:</strong> {description}
                    </span>
                    <span className="pad">
                      <strong>Stage:</strong> {stage}
                    </span>
                    <span className="pad">
                      <strong>Estimated weight:</strong> {estimated_weight}{' '}
                      {weight_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimated height:</strong> {estimated_height}{' '}
                      {height_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimdated width:</strong> {estimated_width}{' '}
                      {width_unit}
                    </span>
                    <span className="pad">
                      <strong>Created By:</strong> {createdBy}
                    </span>
                    <span className="pad">
                      <strong>Created at:</strong> {created_at}
                    </span>
                    <span className="pad">
                      <strong>Update at:</strong> {update_at}
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
