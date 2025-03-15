import React, { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import axios from 'axios'

interface AddMaterialModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}
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

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  show,
  onClose,
  onSuccess,
}) => {
  const { productName, productId } = useParams<{
    productName: string
    productId: string
  }>()

  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [estimatedHeight, setEstimatedHeight] = useState('')
  const [estimatedWidth, setEstimatedWidth] = useState('')
  const [estimatedWeight, setEstimatedWeight] = useState('')
  const [length, setLength] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (
      !name ||
      !qty ||
      !estimatedHeight ||
      !estimatedWidth ||
      !estimatedWeight ||
      !length
    ) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      const codeVerifier = generateCodeVerifier(43)
      const challenge = await generateCodeChallenge(codeVerifier)

      const initiateResponse = await axios.post(
        'https://backend-tests.conceptocar.xyz/products/initiate_material',
        { challenge },
        { withCredentials: true }
      )
      const modifyID = initiateResponse.data.id

      const payload = {
        name,
        material_description:
          'pt moment nu folosim descrierea materialului la nimic ',
        modifyID,
        code_verifier: codeVerifier,
        estimated_height: Number(estimatedHeight),
        estimated_width: Number(estimatedWidth),
        estimated_weight: Number(estimatedWeight),
        qty: Number(qty),
        length_unit: Number(length),
        productId: unslugify(productId || ''),
        productName: unslugify(productName || ''),
      }

      await axios.post(
        'https://backend-tests.conceptocar.xyz/products/create-material',
        payload,
        { withCredentials: true }
      )
      if (onSuccess) onSuccess()
      onClose()
      window.location.reload()
      setName('')
      setQty('')

      setEstimatedHeight('')
      setEstimatedWidth('')
      setEstimatedWeight('')
      setLength('')
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response) {
        if (
          err.response.data &&
          err.response.data.errors &&
          err.response.data.errors.length > 0
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
        <Modal.Title>Add Material</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark shadow-lg">
        <Form
          onSubmit={handleSubmit}
          className="text-light modal-form bg-dark rounded"
        >
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style text-light">Name:</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter material name"
            />
          </Form.Group>

          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">Quantity:</Form.Label>
            <Form.Control
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Enter quantity"
            />
          </Form.Group>

          {/* Length (sent as length_unit) */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">
              Estimated Length (cm):
            </Form.Label>
            <Form.Control
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g., 100 "
            />
          </Form.Group>

          {/* Estimated Width */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">
              Estimated Width (cm):
            </Form.Label>
            <Form.Control
              type="number"
              value={estimatedWidth}
              onChange={(e) => setEstimatedWidth(e.target.value)}
              placeholder="e.g., 50   "
            />
          </Form.Group>

          {/* Estimated Height */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">
              Estimated Height (cm):
            </Form.Label>
            <Form.Control
              type="number"
              value={estimatedHeight}
              onChange={(e) => setEstimatedHeight(e.target.value)}
              placeholder="e.g., 80  "
            />
          </Form.Group>

          {/* Estimated Weight */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">
              Estimated Weight (kg):
            </Form.Label>
            <Form.Control
              type="number"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(e.target.value)}
              placeholder="e.g., 2  "
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      <Modal.Footer className="bg-dark border-warning">
        <Button
          variant="secondary"
          onClick={onClose}
          className="rounded-pill px-4 text-LIGHT fw-bold"
        >
          Cancel
        </Button>
        <Button
          variant="warning"
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-pill px-4 text-dark fw-bold"
        >
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddMaterialModal
