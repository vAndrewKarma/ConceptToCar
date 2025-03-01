import { Form, Button, Modal } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAxios from 'axios-hooks'
import './product.css'
import '../auth/login.css'
import './products.css'

function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0) + word.slice(1))
    .join(' ')
}
const generateCodeVerifier = (length: number): string => {
  const allowedChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomArray = new Uint8Array(length)
  crypto.getRandomValues(randomArray)
  return Array.from(
    randomArray,
    (byte) => allowedChars[byte % allowedChars.length]
  ).join('')
}

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function Product() {
  const { name: productName } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditShow = () => {
    setProduct(product)
    setShowEditModal(true)
  }

  const handleEditClose = () => setShowEditModal(false)

  const [{ loading, error }, execute] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/get-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

  const [product, setProduct] = useState<{
    _id: string
    name: string
    description?: string
    stage?: string
    estimated_weight?: string
    weight_unit?: string
    estimated_height?: string
    height_unit?: string
    estimated_width?: string
    width_unit?: string
    createdBy?: string
    created_at?: string
    updated_at?: string
  } | null>(null)

  // Add delete hooks
  const [, executeInit] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/initiate_product',
      method: 'POST',
    },
    { manual: true }
  )

  const [, executedelete] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/delete-product',
      method: 'POST',
    },
    { manual: true }
  )
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
    _id: '1',
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
  const handleDelete = async () => {
    if (!product) return

    try {
      const code_verifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(code_verifier)
      const res = await executeInit({
        data: { challenge },
        withCredentials: true,
      })
      const modifyID = res.data.id

      await executedelete({
        data: {
          productId: product._id,
          modifyID: modifyID,
          code_verifier: code_verifier,
          name: product.name,
        },
        withCredentials: true,
      })

      navigate('/products')
    } catch (error) {
      console.error('Error deleting product:', error)
    }
    handleClose()
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
                      Product
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
                      {displayProduct.created_at
                        ? new Date(
                            displayProduct.created_at
                          ).toLocaleDateString()
                        : 'N/A'}{' '}
                      at{' '}
                      {displayProduct.created_at
                        ? new Date(
                            displayProduct.created_at
                          ).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                    <span className="pad">
                      <strong>Updated at:</strong>{' '}
                      {displayProduct.updated_at
                        ? new Date(
                            displayProduct.updated_at
                          ).toLocaleDateString()
                        : 'N/A'}{' '}
                      at{' '}
                      {displayProduct.updated_at
                        ? new Date(
                            displayProduct.updated_at
                          ).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center phone"
                    style={{ paddingTop: '15px' }}
                  >
                    <Button
                      className="btn btn-warning"
                      onClick={handleEditShow}
                    >
                      Modify
                    </Button>
                    <Button
                      onClick={() =>
                        navigate(
                          `/product/${productName}/${displayProduct._id}/materials`
                        )
                      }
                      className="btn btn-warning"
                    >
                      {' '}
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

      {/* Delete Modal */}
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
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modify Modal */}
      <Modal show={showEditModal} onHide={handleEditClose} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark shadow-lg">
          <Form className="text-light modal-form rounded">
            <Form.Group>
              <Form.Label className="modal-style">Name:</Form.Label>
              <Form.Control type="text" defaultValue={product?.name} />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Description:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                defaultValue={product?.description}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">Stage:</Form.Label>
              <Form.Control type="text" defaultValue={product?.stage} />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated weight (kg):
              </Form.Label>
              <Form.Control
                type="number"
                defaultValue={product?.estimated_weight}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated height (cm):
              </Form.Label>
              <Form.Control
                type="number"
                defaultValue={product?.estimated_height}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="modal-style">
                Estimated width (cm):
              </Form.Label>
              <Form.Control
                type="number"
                defaultValue={product?.estimated_width}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={handleEditClose}>
            Cancel
          </Button>
          <Button variant="warning">Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Product
