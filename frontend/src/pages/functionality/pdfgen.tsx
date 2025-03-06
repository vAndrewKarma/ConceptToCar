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

const stagesOrder: Stage[] = [
  'concept',
  'feasibility',
  'design',
  'production',
  'withdrawal',
  'standby',
  'cancelled',
]

const STATUS_COLORS = {
  active: '#4CAF50',
  inactive: '#F44336',
  standby: '#FFC107',
  default: '#9E9E9E',
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number
): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  const charWidth = fontSize * 0.6

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
  const width = 595 // A4 width
  const height = 842 // A4 height
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

  // Header
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

  // Metadata
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

  // Product info
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

    // Value
    const displayValue = label === 'Stage' ? capitalize(value) : value
    const lines = wrapText(
      `${displayValue}${unit ? ` ${unit}` : ''}`,
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

    // Add work status for Stage field
    if (label === 'Stage') {
      const currentStage = value as Stage
      const activeStages: Stage[] = [
        'concept',
        'feasibility',
        'design',
        'production',
      ]
      const isActive = activeStages.includes(currentStage)
      const statusColor = isActive
        ? STATUS_COLORS.active
        : STATUS_COLORS.inactive
      const statusText = isActive ? 'In Work' : 'Out of Work'

      const statusGroup = document.createElementNS(svgNS, 'g')
      statusGroup.setAttribute('transform', `translate(500, ${textY - 10})`)

      // Status indicator
      const indicator = document.createElementNS(svgNS, 'circle')
      indicator.setAttribute('cx', '0')
      indicator.setAttribute('cy', '0')
      indicator.setAttribute('r', '6')
      indicator.setAttribute('fill', statusColor)
      statusGroup.appendChild(indicator)

      // Status text
      const statusLabel = document.createElementNS(svgNS, 'text')
      statusLabel.setAttribute('x', '15')
      statusLabel.setAttribute('y', '4')
      statusLabel.setAttribute('fill', '#fff')
      statusLabel.setAttribute('font-size', '12px')
      statusLabel.setAttribute('font-family', 'Arial, sans-serif')
      statusLabel.textContent = statusText
      statusGroup.appendChild(statusLabel)

      svg.appendChild(statusGroup)
    }

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

  // Status progress circle
  const currentStage = (product?.stage as Stage) || 'default'
  const activeStages: Stage[] = [
    'concept',
    'feasibility',
    'design',
    'production',
  ]
  const isActive = activeStages.includes(currentStage)
  const progress = isActive
    ? stagesOrder.indexOf(currentStage) / (activeStages.length - 1)
    : 0
  const statusColor = isActive
    ? STATUS_COLORS.active
    : ['standby', 'withdrawal'].includes(currentStage)
    ? STATUS_COLORS.standby
    : STATUS_COLORS.inactive

  const statusGroup = document.createElementNS(svgNS, 'g')
  statusGroup.setAttribute('transform', `translate(${width - 200}, 180)`)

  // Background circle
  const bgCircle = document.createElementNS(svgNS, 'circle')
  bgCircle.setAttribute('cx', '0')
  bgCircle.setAttribute('cy', '0')
  bgCircle.setAttribute('r', '50')
  bgCircle.setAttribute('fill', 'rgba(255, 255, 255, 0.1)')
  statusGroup.appendChild(bgCircle)

  // Progress elements
  if (isActive) {
    const progressArc = document.createElementNS(svgNS, 'circle')
    progressArc.setAttribute('cx', '0')
    progressArc.setAttribute('cy', '0')
    progressArc.setAttribute('r', '45')
    progressArc.setAttribute('fill', 'none')
    progressArc.setAttribute('stroke', statusColor)
    progressArc.setAttribute('stroke-width', '6')
    progressArc.setAttribute(
      'stroke-dasharray',
      `${2 * Math.PI * 45 * progress} 1000`
    )
    progressArc.setAttribute('stroke-linecap', 'round')
    progressArc.setAttribute('transform', 'rotate(-90 0 0)')
    statusGroup.appendChild(progressArc)

    const percentText = document.createElementNS(svgNS, 'text')
    percentText.setAttribute('x', '0')
    percentText.setAttribute('y', '0')
    percentText.setAttribute('text-anchor', 'middle')
    percentText.setAttribute('dominant-baseline', 'middle')
    percentText.setAttribute('fill', statusColor)
    percentText.setAttribute('font-size', '24px')
    percentText.setAttribute('font-weight', 'bold')
    percentText.textContent = `${Math.round(progress * 100)}%`
    statusGroup.appendChild(percentText)
  } else {
    const statusText = document.createElementNS(svgNS, 'text')
    statusText.setAttribute('x', '0')
    statusText.setAttribute('y', '0')
    statusText.setAttribute('text-anchor', 'middle')
    statusText.setAttribute('dominant-baseline', 'middle')
    statusText.setAttribute('fill', statusColor)
    statusText.setAttribute('font-size', '16px')
    statusText.setAttribute('font-weight', 'bold')
    statusText.textContent =
      currentStage === 'cancelled' ? 'Terminated' : 'Out of Work'
    statusGroup.appendChild(statusText)
  }

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
      format: [595, 842],
    })

    await svg2pdf(svgElement, pdf, { x: 0, y: 0 })

    const fileName = product?.name
      ? `${product.name.replace(/\s+/g, '_')}_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      : `ConceptoCar_Report_${new Date().toISOString().slice(0, 10)}.pdf`

    pdf.save(fileName)
  }

  return (
    <button className="btn btn-warning" onClick={handleExportPDF}>
      Generate Professional Report
    </button>
  )
}

export default ExportChartPDF
