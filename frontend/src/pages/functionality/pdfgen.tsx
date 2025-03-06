import React from 'react'
import { jsPDF } from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'

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

interface ExportChartPDFProps {
  product: ProductData | null
}

const STATUS_COLORS: Record<Stage | 'default', string> = {
  concept: '#4CAF50',
  feasibility: '#4CAF50',
  design: '#4CAF50',
  production: '#4CAF50',
  withdrawal: '#FFC107',
  standby: '#FFC107',
  cancelled: '#F44336',
  default: '#9E9E9E',
}

const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number
): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  const charWidth = fontSize * 0.6 // Approximate width calculation

  words.forEach((word) => {
    if ((currentLine + word).length * charWidth < maxWidth) {
      currentLine += `${word} `
    } else {
      lines.push(currentLine.trim())
      currentLine = `${word} `
    }
  })
  lines.push(currentLine.trim())
  return lines
}

const generateChartSVG = (product: ProductData | null): SVGSVGElement => {
  const svgNS = 'http://www.w3.org/2000/svg'
  const width = 595 // A4 width in pixels (portrait)
  const height = 842 // A4 height in pixels
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('id', 'chart-svg')
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())

  // Gradient background
  const defs = document.createElementNS(svgNS, 'defs')
  const gradient = document.createElementNS(svgNS, 'linearGradient')
  gradient.setAttribute('id', 'background-gradient')
  gradient.setAttribute('x1', '0%')
  gradient.setAttribute('y1', '0%')
  gradient.setAttribute('x2', '100%')
  gradient.setAttribute('y2', '100%')

  const stops = [
    { offset: '25%', color: 'rgb(5, 10, 17)' },
    { offset: '50%', color: 'rgb(14, 69, 74)' },
    { offset: '75%', color: 'rgb(5, 10, 17)' },
  ]

  stops.forEach((stop) => {
    const stopElement = document.createElementNS(svgNS, 'stop')
    stopElement.setAttribute('offset', stop.offset)
    stopElement.setAttribute('stop-color', stop.color)
    gradient.appendChild(stopElement)
  })

  defs.appendChild(gradient)
  svg.appendChild(defs)

  // Background rectangle
  const background = document.createElementNS(svgNS, 'rect')
  background.setAttribute('width', width.toString())
  background.setAttribute('height', height.toString())
  background.setAttribute('fill', 'url(#background-gradient)')
  svg.appendChild(background)

  // Header section
  const header = document.createElementNS(svgNS, 'rect')
  header.setAttribute('x', '0')
  header.setAttribute('y', '0')
  header.setAttribute('width', width.toString())
  header.setAttribute('height', '100')
  header.setAttribute('fill', 'rgba(0, 40, 60, 0.8)')
  svg.appendChild(header)

  // Company branding
  const logoText = document.createElementNS(svgNS, 'text')
  logoText.setAttribute('x', '40')
  logoText.setAttribute('y', '50')
  logoText.setAttribute('fill', '#fff')
  logoText.setAttribute('font-size', '24px')
  logoText.setAttribute('font-family', 'Arial, sans-serif')
  logoText.setAttribute('font-weight', 'bold')
  logoText.textContent = 'CONCEPTOCAR'
  svg.appendChild(logoText)

  const reportTitle = document.createElementNS(svgNS, 'text')
  reportTitle.setAttribute('x', '40')
  reportTitle.setAttribute('y', '80')
  reportTitle.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
  reportTitle.setAttribute('font-size', '18px')
  reportTitle.setAttribute('font-family', 'Arial, sans-serif')
  reportTitle.textContent = 'Product Development Report'
  svg.appendChild(reportTitle)

  // Metadata grid
  const metadata = document.createElementNS(svgNS, 'g')
  let metaY = 40
  const addMetadata = (label: string, value?: string) => {
    if (!value) return

    const text = document.createElementNS(svgNS, 'text')
    text.setAttribute('x', (width - 200).toString())
    text.setAttribute('y', metaY.toString())
    text.setAttribute('fill', '#fff')
    text.setAttribute('font-size', '12px')
    text.setAttribute('font-family', 'Arial, sans-serif')
    text.innerHTML = `<tspan font-weight="bold">${label}:</tspan> ${value}`
    metadata.appendChild(text)
    metaY += 20
  }

  if (product) {
    addMetadata(
      'Created',
      product.created_at
        ? new Date(product.created_at).toLocaleDateString()
        : 'N/A'
    )
    addMetadata(
      'Last Updated',
      product.updated_at
        ? new Date(product.updated_at).toLocaleDateString()
        : 'N/A'
    )
    addMetadata('Created By', product.createdBy || 'N/A')
  }
  svg.appendChild(metadata)

  // Content container
  const content = document.createElementNS(svgNS, 'rect')
  content.setAttribute('x', '40')
  content.setAttribute('y', '120')
  content.setAttribute('width', (width - 80).toString())
  content.setAttribute('height', (height - 200).toString())
  content.setAttribute('rx', '8')
  content.setAttribute('fill', 'rgba(255, 255, 255, 0.1)')
  svg.appendChild(content)

  // Product info section
  let textY = 150
  const maxTextWidth = width - 200

  const addTextBlock = (
    label: string,
    value?: string | null,
    unit?: string | null
  ) => {
    if (!value) return

    // Label
    const labelText = document.createElementNS(svgNS, 'text')
    labelText.setAttribute('x', '60')
    labelText.setAttribute('y', textY.toString())
    labelText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
    labelText.setAttribute('font-size', '14px')
    labelText.setAttribute('font-family', 'Arial, sans-serif')
    labelText.textContent = `${label}:`
    svg.appendChild(labelText)

    // Value with wrapping
    const lines = wrapText(
      `${value}${unit ? ` ${unit}` : ''}`,
      maxTextWidth,
      14
    )
    lines.forEach((line, index) => {
      const valueText = document.createElementNS(svgNS, 'text')
      valueText.setAttribute('x', '200')
      valueText.setAttribute('y', (textY + index * 20).toString())
      valueText.setAttribute('fill', '#fff')
      valueText.setAttribute('font-size', '14px')
      valueText.setAttribute('font-family', 'Arial, sans-serif')
      valueText.textContent = line
      svg.appendChild(valueText)
    })

    textY += lines.length * 20 + 15
  }

  if (product) {
    addTextBlock('Product Name', product.name)
    addTextBlock('Description', product.description)
    addTextBlock('Stage', product.stage)
    addTextBlock(
      'Estimated Weight',
      product.estimated_weight,
      product.weight_unit
    )
    addTextBlock(
      'Estimated Length',
      product.estimated_length,
      product.weight_unit
    )
    addTextBlock(
      'Estimated Height',
      product.estimated_height,
      product.height_unit
    )
    addTextBlock('Estimated Width', product.estimated_width, product.width_unit)
  }

  // Status indicator
  const currentStage = (product?.stage as Stage) || 'default'
  const isActive = !['cancelled', 'withdrawal', 'standby'].includes(
    currentStage
  )
  const statusColor = STATUS_COLORS[currentStage] || STATUS_COLORS.default

  const statusGroup = document.createElementNS(svgNS, 'g')
  statusGroup.setAttribute('transform', `translate(${width - 200}, 180)`)

  // Status circle
  const statusCircle = document.createElementNS(svgNS, 'circle')
  statusCircle.setAttribute('cx', '0')
  statusCircle.setAttribute('cy', '0')
  statusCircle.setAttribute('r', '50')
  statusCircle.setAttribute('fill', statusColor)
  statusCircle.setAttribute('opacity', '0.2')
  statusGroup.appendChild(statusCircle)

  // Status text
  const statusText = document.createElementNS(svgNS, 'text')
  statusText.setAttribute('x', '0')
  statusText.setAttribute('y', '0')
  statusText.setAttribute('text-anchor', 'middle')
  statusText.setAttribute('dominant-baseline', 'middle')
  statusText.setAttribute('fill', statusColor)
  statusText.setAttribute('font-size', '18px')
  statusText.setAttribute('font-weight', 'bold')
  statusText.setAttribute('font-family', 'Arial, sans-serif')
  statusText.textContent = isActive ? 'ACTIVE' : 'INACTIVE'
  statusGroup.appendChild(statusText)

  // Stage-specific message
  const stageMessage = document.createElementNS(svgNS, 'text')
  stageMessage.setAttribute('x', '0')
  stageMessage.setAttribute('y', '30')
  stageMessage.setAttribute('text-anchor', 'middle')
  stageMessage.setAttribute('fill', '#fff')
  stageMessage.setAttribute('font-size', '14px')
  stageMessage.setAttribute('font-family', 'Arial, sans-serif')

  switch (currentStage) {
    case 'cancelled':
      stageMessage.textContent = 'Project terminated'
      break
    case 'standby':
      stageMessage.textContent = 'On hold'
      break
    case 'withdrawal':
      stageMessage.textContent = 'Being phased out'
      break
    default:
      stageMessage.textContent = 'In development'
  }
  statusGroup.appendChild(stageMessage)

  svg.appendChild(statusGroup)

  // Footer
  const footer = document.createElementNS(svgNS, 'rect')
  footer.setAttribute('x', '0')
  footer.setAttribute('y', (height - 60).toString())
  footer.setAttribute('width', width.toString())
  footer.setAttribute('height', '60')
  footer.setAttribute('fill', 'rgba(0, 40, 60, 0.8)')
  svg.appendChild(footer)

  const footerText = document.createElementNS(svgNS, 'text')
  footerText.setAttribute('x', (width / 2).toString())
  footerText.setAttribute('y', (height - 20).toString())
  footerText.setAttribute('text-anchor', 'middle')
  footerText.setAttribute('fill', 'rgba(255, 255, 255, 0.7)')
  footerText.setAttribute('font-size', '12px')
  footerText.setAttribute('font-family', 'Arial, sans-serif')
  footerText.textContent = `Confidential Document - ${new Date().toLocaleDateString()} - ConceptoCar Systems`
  svg.appendChild(footerText)

  return svg
}

const ExportChartPDF: React.FC<ExportChartPDFProps> = ({ product }) => {
  const handleExportPDF = async () => {
    const svgElement = generateChartSVG(product)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [595, 842], // Standard A4 size
    })

    await svg2pdf(svgElement, pdf, { x: 0, y: 0 })

    const fileName = product?.name
      ? `${product.name.replace(/\s+/g, '_')}_Report.pdf`
      : 'ConceptoCar_Report.pdf'

    pdf.save(fileName)
  }

  return (
    <button className="btn btn-warning" onClick={handleExportPDF}>
      Generate Professional Report
    </button>
  )
}

export default ExportChartPDF
