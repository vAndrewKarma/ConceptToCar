import { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import axios from 'axios'

import './products.css'
const generateCodeVerifier = (height = 43) => {
  const allowedChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomArray = new Uint8Array(height)
  crypto.getRandomValues(randomArray)
  return Array.from(
    randomArray,
    (byte) => allowedChars[byte % allowedChars.length]
  ).join('')
}

const generateCodeChallenge = async (verifier: string | undefined) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

interface AddProductModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AddProductModal = ({
  show,
  onClose,
  onSuccess,
}: AddProductModalProps) => {
  const [addName, setAddName] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addheight, setAddheight] = useState('')
  const [addWidth, setAddWidth] = useState('')
  const [addWeight, setAddWeight] = useState('')
  const [addLength, setAddLength] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')

      const codeVerifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(codeVerifier)

      const initRes = await axios.post(
        'https://backend-tests.conceptocar.xyz/products/initiate_product',
        { challenge },
        {
          withCredentials: true,
        }
      )
      const modifyID = initRes.data.id

      const productData = {
        name: addName,
        description: addDescription,
        modifyID,
        code_verifier: codeVerifier,
        estimated_height: parseFloat(addheight),
        estimated_length: parseFloat(addLength),
        estimated_width: parseFloat(addWidth),
        estimated_weight: parseFloat(addWeight),
      }

      const createRes = await axios.post(
        'https://backend-tests.conceptocar.xyz/products/create-product',
        productData,
        {
          withCredentials: true,
        }
      )

      if (createRes.data.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onSuccess && onSuccess()
        onClose()
        window.location.reload()
        setAddName('')
        setAddDescription('')
        setAddheight('')
        setAddWidth('')
        setAddWeight('')
        setAddLength('')
      } else {
        setError('Failed to create product.')
      }
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response) {
        if (
          err.response.data &&
          err.response.data.errors &&
          err.response.data.errors.height > 0
        ) {
          setError(err.response.data.errors[0].message)
        } else if (err.response.data.message) {
          setError(err.response.data.message)
        }
      } else {
        setError('Failed to create product. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="modal-dark">
      <Modal.Header closeButton className="bg-dark text-white border-warning">
        <Modal.Title>Add Product</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light shadow-lg">
        <Form className="bg-dark text-light ">
          <Form.Group controlId="addProductName" className="mb-3">
            <Form.Label className="text-light fw-bold fw-italic">
              Name:
            </Form.Label>
            <Form.Control
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Enter product name"
            />
          </Form.Group>
          <Form.Group controlId="addProductDescription" className="mb-3">
            <Form.Label className="text-light fw-bold">Description:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </Form.Group>
          <Form.Group controlId="addProductLength" className="mb-3">
            <Form.Label className="text-light fw-bold">
              Estimated Length (cm):
            </Form.Label>
            <Form.Control
              type="number"
              value={addLength}
              onChange={(e) => setAddLength(e.target.value)}
              placeholder="e.g., 100 (by default 0)"
            />
          </Form.Group>
          <Form.Group controlId="addProductWidth" className="mb-3">
            <Form.Label className="text-light fw-bold">
              Estimated Width (cm):
            </Form.Label>
            <Form.Control
              type="number"
              value={addWidth}
              onChange={(e) => setAddWidth(e.target.value)}
              placeholder="e.g., 50  (by default 0) "
            />
          </Form.Group>
          <Form.Group controlId="addProductLength" className="mb-3">
            <Form.Label className="text-light fw-bold">
              Estimated Height (kg):
            </Form.Label>
            <Form.Control
              type="number"
              value={addheight}
              onChange={(e) => setAddheight(e.target.value)}
              placeholder="e.g., 35  (by default 0) "
            />
          </Form.Group>
          <Form.Group controlId="addProductWeight" className="mb-3">
            <Form.Label className="text-light fw-bold">
              Estimated Weight (kg):
            </Form.Label>
            <Form.Control
              type="number"
              value={addWeight}
              onChange={(e) => setAddWeight(e.target.value)}
              placeholder="e.g., 80  (by default 0) "
            />
          </Form.Group>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-dark border-warning">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="rounded-pill px-4"
        >
          Cancel
        </Button>
        <Button
          variant="warning"
          onClick={handleSave}
          disabled={loading}
          className="rounded-pill px-4 text-dark fw-bold"
        >
          {loading ? 'Saving...' : 'Add Product'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default AddProductModal
