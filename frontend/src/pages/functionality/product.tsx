import { Form, Button, Modal } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAxios from 'axios-hooks'
import './product.css'
import '../auth/login.css'

function Product() {
  const { name: productName } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  const [{ loading, error, data: product }, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/get-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

  useEffect(() => {
    if (productName) {
      execute({
        data: { name: productName },
      })
    }
  }, [productName, execute])

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

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
                      Product Page
                    </Form.Label>
                  </div>
                  <div className="d-flex flex-column justify-content-start style">
                    <span>
                      <strong>Name:</strong> {product?.name}
                    </span>
                    <span className="pad">
                      <strong>Description:</strong> {product?.description}
                    </span>
                    <span className="pad">
                      <strong>Stage:</strong> {product?.stage}
                    </span>
                    <span className="pad">
                      <strong>Estimated weight:</strong>{' '}
                      {product?.estimated_weight} {product?.weight_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimated height:</strong>{' '}
                      {product?.estimated_height} {product?.height_unit}
                    </span>
                    <span className="pad">
                      <strong>Estimated width:</strong>{' '}
                      {product?.estimated_width} {product?.width_unit}
                    </span>
                    <span className="pad">
                      <strong>Created By:</strong> {product?.createdBy}
                    </span>
                    <span className="pad">
                      <strong>Created at:</strong>{' '}
                      {product ? formatDate(product.created_at) : ''}
                    </span>
                    <span className="pad">
                      <strong>Updated at:</strong>{' '}
                      {product ? formatDate(product.updated_at) : ''}
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
