import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import axios from 'axios'

interface Material {
  name: string
  estimated_height: number
  estimated_width: number
  estimated_weight: number
  qty: number
  length_unit: string

  // additional fields as needed
}

interface UpdateMaterialModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
  selectedMaterial: Material | null
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
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0) + word.slice(1))
    .join(' ')
}
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const UpdateMaterialModal: React.FC<UpdateMaterialModalProps> = ({
  show,
  onClose,
  onSuccess,
  selectedMaterial,
}) => {
  // Get productName and productId from URL if needed.
  const { productName: urlProductName, productId: urlProductId } = useParams<{
    productName: string
    productId: string
  }>()

  // Local state for each field. When the modal opens, pre-fill the values.
  const [name, setName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [estimatedHeight, setEstimatedHeight] = useState('')
  const [estimatedWidth, setEstimatedWidth] = useState('')
  const [estimatedWeight, setEstimatedWeight] = useState('')
  const [qty, setQty] = useState('')
  const [length, setLength] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedMaterial) {
      setName(selectedMaterial.name)
      setOriginalName(selectedMaterial.name)
      setEstimatedHeight(String(selectedMaterial.estimated_height))
      setEstimatedWidth(String(selectedMaterial.estimated_width))
      setEstimatedWeight(String(selectedMaterial.estimated_weight))
      setQty(String(selectedMaterial.qty))
      setLength(String(selectedMaterial.length_unit))
    }
  }, [selectedMaterial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (
      !name ||
      !estimatedHeight ||
      !estimatedWidth ||
      !estimatedWeight ||
      !qty ||
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

      console.log(unslugify(urlProductId || ''))
      const payload = {
        name,
        originalName,
        material_description: 'not implemented yeet',
        estimated_height: Number(estimatedHeight),
        estimated_width: Number(estimatedWidth),
        estimated_weight: Number(estimatedWeight),
        qty: Number(qty),
        length_unit: Number(length),
        productId: unslugify(urlProductId || ''),
        productName: unslugify(urlProductName || ''),
        code_verifier: codeVerifier,
        modifyID,
      }

      await axios.post(
        'https://backend-tests.conceptocar.xyz/products/update-bom',
        payload,
        { withCredentials: true }
      )

      // On success, trigger the onSuccess callback and close/reset.
      if (onSuccess) onSuccess()
      onClose()
      // Reset state
      window.location.reload()
      setName('')
      setOriginalName('')
      setEstimatedHeight('')
      setEstimatedWidth('')
      setEstimatedWeight('')
      setQty('')
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
        setError('Failed to update materal. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="modal-dark">
      <Modal.Header closeButton className="bg-dark text-white border-warning">
        <Modal.Title>Update Material</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark shadow-lg">
        <Form
          onSubmit={handleSubmit}
          className="text-light modal-form bg-dark rounded"
        >
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">Name:</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label className="modal-style">Quantity:</Form.Label>
            <Form.Control
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
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
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      {error && (
        <Alert variant="danger" className="mt-3">
          {' '}
          {error}
        </Alert>
      )}
      <Modal.Footer className="bg-dark border-warning">
        <Button
          className="rounded-pill px-4 text-light fw-bold"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="rounded-pill px-4 text-dark fw-bold"
          variant="warning"
          onClick={(e) => handleSubmit(e)}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UpdateMaterialModal
