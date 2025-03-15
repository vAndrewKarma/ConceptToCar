import { Form, Button, Modal, Alert } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAxios from 'axios-hooks'
import './product.css'
import '../auth/login.css'
import './products.css'
import ExportChartPDF from './pdfgen'
import axios from 'axios'
import { useAuth } from '../../hook/useAuth'

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
type Stage =
  | 'concept'
  | 'feasibility'
  | 'design'
  | 'production'
  | 'withdrawal'
  | 'standby'
  | 'cancelled'

interface ProductData {
  _id: string
  name: string
  description?: string
  stage?: string
  estimated_weight?: string
  estimated_length?: string
  weight_unit?: string
  estimated_height?: string
  height_unit?: string
  estimated_width?: string
  width_unit?: string
  createdBy?: string
  created_at?: string
  updated_at?: string
}

function Product() {
  const { name: productName } = useParams()
  const navigate = useNavigate()
  const { data } = useAuth()
  const role = data.session.role
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [serror, ssetError] = useState('')
  const [editEstimatedHeight, setEditEstimatedHeight] = useState('')
  const [editEstimatedWidth, setEditEstimatedWidth] = useState('')
  const [editEstimatedWeight, setEditEstimatedWeight] = useState('')

  const defaultProduct: ProductData = {
    _id: '1',
    name: 'Wheel',
    description:
      "A wheel is a crucial component of a vehicle's mobility and steering system. It provides the necessary contact with the road, ensuring traction, stability, and smooth movement. In the steering mechanism, the front wheels pivot to change the vehicle’s direction, guided by the steering system.",
    stage: 'Concept',
    estimated_weight: '5',
    estimated_length: '30',
    weight_unit: 'kg',
    estimated_height: '60',
    height_unit: 'cm',
    estimated_width: '32',
    width_unit: 'cm',
    createdBy: 'Stanciu Iustin',
    created_at: '18.02.2025',
    updated_at: '20.02.2025',
  }
  const [editEstimatedLength, setEditEstimatedLength] = useState('')
  const [product, setProduct] = useState<ProductData | null>(null)

  const displayProduct = product || defaultProduct
  const [editStage, setEditStage] = useState<Stage>(
    (displayProduct.stage?.toLowerCase() as Stage) || 'concept'
  )

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

  const [, executeUpdate] = useAxios(
    {
      url: 'https://backend-tests.conceptocar.xyz/products/update-product',
      method: 'POST',
      withCredentials: true,
    },
    { manual: true }
  )

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
          if (response.data._id) {
            setProduct(response.data)
          } else if (response.data.prodb._id) {
            setProduct(response.data.prodb_id)
          } else {
            setProduct(response.data)
          }
        })
        .catch(() => {})
    }
  }, [productName, execute])

  if (loading)
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        <div className="spinner"></div>
      </div>
    )
  if (error)
    return (
      <div className="color-overlay d-flex justify-content-center align-items-center">
        Error: {error.response?.data?.message || error.message}
      </div>
    )

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

  const handleEditShow = () => {
    if (product) {
      setEditName(product.name)
      setEditDescription(product.description || '')
      setEditStage((product.stage || 'concept').toLowerCase() as Stage)
      setEditEstimatedHeight(product.estimated_height || '')
      setEditEstimatedWidth(product.estimated_width || '')
      setEditEstimatedWeight(product.estimated_weight || '')
      setEditEstimatedLength(product.estimated_length || '')
    }
    setShowEditModal(true)
  }
  const handleEditClose = () => setShowEditModal(false)

  const handleSaveChanges = async () => {
    if (!product) return
    try {
      ssetError('')
      const code_verifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(code_verifier)
      const initRes = await executeInit({
        data: { challenge },
        withCredentials: true,
      })
      const modifyID = initRes.data.id
      await executeUpdate({
        data: {
          productId: product._id,
          name: editName,
          description: editDescription,
          stage: editStage.toLowerCase(),
          estimated_height: parseFloat(editEstimatedHeight),
          estimated_width: parseFloat(editEstimatedWidth),
          estimated_weight: parseFloat(editEstimatedWeight),
          estimated_length: parseFloat(editEstimatedLength),
          modifyID: modifyID,
          code_verifier: code_verifier,
        },
        withCredentials: true,
      })

      await execute({ data: { name: editName } })

      setShowEditModal(false)
      setProduct({
        ...product,
        name: editName,
        description: editDescription,
        stage: editStage,
        estimated_height: editEstimatedHeight,
        estimated_width: editEstimatedWidth,
        estimated_weight: editEstimatedWeight,
        estimated_length: editEstimatedLength,
      })
      navigate(`/product/${editName}/${displayProduct._id}`)
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response) {
        if (
          err.response.data &&
          err.response.data.errors &&
          err.response.data.errors.length > 0
        ) {
          ssetError(err.response.data.errors[0].message)
        } else if (err.response.data.message) {
          ssetError(err.response.data.message)
        }
      } else {
        ssetError('Failed to create product. Please try again.')
      }
    }
  }

  return (
    <>
      <div className="color-overlay d-flex justify-content-center align-items-center scroll">
        <div className="scrollable-container">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 d-flex justify-content-center">
                <Form
                  className="rounded p-4 p-sm-3 bg-dark"
                  style={{
                    width: '800px',
                    maxWidth: '90%',
                  }}
                >
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
                      <strong>Stage:</strong>{' '}
                      {displayProduct.stage
                        ? displayProduct.stage.charAt(0).toUpperCase() +
                          displayProduct.stage.slice(1)
                        : 'N/A'}
                    </span>
                    <span className="pad">
                      <strong>Estimated length:</strong>{' '}
                      {displayProduct.estimated_length} cm
                    </span>
                    <span className="pad">
                      <strong>Estimated width:</strong>{' '}
                      {displayProduct.estimated_width} cm
                    </span>
                    <span className="pad">
                      <strong>Estimated height:</strong>{' '}
                      {displayProduct.estimated_height} cm
                    </span>
                    <span className="pad">
                      <strong>Estimated weight:</strong>{' '}
                      {displayProduct.estimated_weight} kg
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
                    {role === 'Admin' && (
                      <>
                        <Button
                          onClick={() =>
                            navigate(
                              `/product/${productName}/${displayProduct._id}/materials`
                            )
                          }
                          className="btn btn-warning"
                        >
                          Materials
                        </Button>
                        <ExportChartPDF product={product} />
                        <Button className="btn btn-danger" onClick={handleShow}>
                          Delete
                        </Button>
                      </>
                    )}
                    {role === 'Portfolio Manager' && (
                      <>
                        <Button
                          onClick={() =>
                            navigate(
                              `/product/${productName}/${displayProduct._id}/materials`
                            )
                          }
                          className="btn btn-warning"
                        >
                          Materials
                        </Button>
                      </>
                    )}
                    {role === 'Seller' && (
                      <>
                        <ExportChartPDF product={product} />
                      </>
                    )}
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

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={handleEditClose}
        centered
        dialogClassName="modal-dark"
      >
        <Modal.Header closeButton className="bg-dark text-white border-warning">
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark shadow-lg">
          <Form className="text-light bg-dark modal-form rounded">
            <Form.Group>
              <Form.Label className="modal-style">Name:</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">Description:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">Stage:</Form.Label>
              <Form.Control
                as="select"
                value={editStage}
                onChange={(e) => setEditStage(e.target.value as Stage)}
              >
                {[
                  'concept',
                  'feasibility',
                  'design',
                  'production',
                  'withdrawal',
                  'standby',
                  'cancelled',
                ].map((stageOption, idx) => (
                  <option key={idx} value={stageOption}>
                    {stageOption.charAt(0).toUpperCase() + stageOption.slice(1)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">
                Estimated length (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedLength}
                onChange={(e) => setEditEstimatedLength(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">
                Estimated width (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedWidth}
                onChange={(e) => setEditEstimatedWidth(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">
                Estimated height (cm):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedHeight}
                onChange={(e) => setEditEstimatedHeight(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="modal-style">
                Estimated weight (kg):
              </Form.Label>
              <Form.Control
                type="number"
                value={editEstimatedWeight}
                onChange={(e) => setEditEstimatedWeight(e.target.value)}
              />
            </Form.Group>
            {serror && (
              <Alert variant="danger" className="mt-3">
                {serror}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-warning">
          <Button
            variant="secondary"
            onClick={handleEditClose}
            className="rounded-pill px-4 text-light fw-bold"
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleSaveChanges}
            className="rounded-pill px-4 text-dark fw-bold"
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Product
