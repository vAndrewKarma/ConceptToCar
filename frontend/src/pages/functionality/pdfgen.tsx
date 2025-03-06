import React from 'react'
import { jsPDF } from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { Stage } from './products'

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

const generateChartSVG = (product: ProductData | null): SVGSVGElement => {
  const svgNS = 'http://www.w3.org/2000/svg'
  const width = 600 // Portrait width
  const height = 800 // Portrait height
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
  const headerHeight = 100
  const header = document.createElementNS(svgNS, 'rect')
  header.setAttribute('x', '0')
  header.setAttribute('y', '0')
  header.setAttribute('width', width.toString())
  header.setAttribute('height', headerHeight.toString())
  header.setAttribute('fill', 'rgba(0, 0, 0, 0.3)')
  svg.appendChild(header)

  // Header text
  const headerText = document.createElementNS(svgNS, 'text')
  headerText.setAttribute('x', '30')
  headerText.setAttribute('y', '50')
  headerText.setAttribute('fill', '#fff')
  headerText.setAttribute('font-size', '24px')
  headerText.setAttribute('font-weight', 'bold')
  headerText.setAttribute('font-family', 'Arial, sans-serif')
  headerText.textContent = product?.name || 'Product Report'
  svg.appendChild(headerText)

  // Metadata section
  let metaY = 70
  const addMetaText = (text: string, y: number) => {
    const elem = document.createElementNS(svgNS, 'text')
    elem.setAttribute('x', '30')
    elem.setAttribute('y', y.toString())
    elem.setAttribute('fill', 'rgba(255, 255, 255, 0.7)')
    elem.setAttribute('font-size', '12px')
    elem.setAttribute('font-family', 'Arial, sans-serif')
    elem.textContent = text
    svg.appendChild(elem)
  }

  if (product) {
    if (product.created_at) {
      addMetaText(
        `Created: ${new Date(product.created_at).toLocaleDateString()}`,
        metaY
      )
      metaY += 20
    }
    if (product.updated_at) {
      addMetaText(
        `Updated: ${new Date(product.updated_at).toLocaleDateString()}`,
        metaY
      )
      metaY += 20
    }
    if (product.createdBy) {
      addMetaText(`Created by: ${product.createdBy}`, metaY)
    }
  }

  // Main content container
  const content = document.createElementNS(svgNS, 'rect')
  content.setAttribute('x', '20')
  content.setAttribute('y', '120')
  content.setAttribute('width', (width - 40).toString())
  content.setAttribute('height', (height - 180).toString())
  content.setAttribute('rx', '10')
  content.setAttribute('fill', 'rgba(255, 255, 255, 0.1)')
  svg.appendChild(content)

  // Product info section
  const margin = 40
  let textY = 160
  const lineHeight = 28

  const addTextLine = (
    label: string,
    value?: string | null,
    unit?: string | null
  ) => {
    if (!value) return

    const group = document.createElementNS(svgNS, 'g')

    // Label
    const labelText = document.createElementNS(svgNS, 'text')
    labelText.setAttribute('x', margin.toString())
    labelText.setAttribute('y', textY.toString())
    labelText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
    labelText.setAttribute('font-size', '14px')
    labelText.setAttribute('font-family', 'Arial, sans-serif')
    labelText.textContent = `${label}:`

    // Value
    const valueText = document.createElementNS(svgNS, 'text')
    valueText.setAttribute('x', (margin + 150).toString())
    valueText.setAttribute('y', textY.toString())
    valueText.setAttribute('fill', '#fff')
    valueText.setAttribute('font-size', '16px')
    valueText.setAttribute('font-weight', 'bold')
    valueText.setAttribute('font-family', 'Arial, sans-serif')
    valueText.textContent = `${value}${unit ? ` ${unit}` : ''}`

    group.appendChild(labelText)
    group.appendChild(valueText)
    svg.appendChild(group)
    textY += lineHeight
  }

  if (product) {
    addTextLine('Product Name', product.name)
    addTextLine('Description', product.description)
    addTextLine('Stage', product.stage)
    addTextLine(
      'Estimated Weight',
      product.estimated_weight,
      product.weight_unit
    )
    addTextLine(
      'Estimated Length',
      product.estimated_length,
      product.weight_unit
    )
    addTextLine(
      'Estimated Height',
      product.estimated_height,
      product.height_unit
    )
    addTextLine('Estimated Width', product.estimated_width, product.width_unit)
  }

  // Stage progress circle
  const progress = product?.stage
    ? (stagesOrder.indexOf(product.stage as Stage) + 1) / stagesOrder.length
    : 0

  const circleSize = 160
  const circleX = width - margin - circleSize / 2
  const circleY = height / 2 + 60

  // Background circle
  const bgCircle = document.createElementNS(svgNS, 'circle')
  bgCircle.setAttribute('cx', circleX.toString())
  bgCircle.setAttribute('cy', circleY.toString())
  bgCircle.setAttribute('r', (circleSize / 2).toString())
  bgCircle.setAttribute('fill', 'none')
  bgCircle.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)')
  bgCircle.setAttribute('stroke-width', '8')
  svg.appendChild(bgCircle)

  // Progress arc
  const progressArc = document.createElementNS(svgNS, 'circle')
  progressArc.setAttribute('cx', circleX.toString())
  progressArc.setAttribute('cy', circleY.toString())
  progressArc.setAttribute('r', (circleSize / 2).toString())
  progressArc.setAttribute('fill', 'none')
  progressArc.setAttribute('stroke', '#00f2fe')
  progressArc.setAttribute('stroke-width', '8')
  progressArc.setAttribute(
    'stroke-dasharray',
    `${2 * Math.PI * (circleSize / 2) * progress} 1000`
  )
  progressArc.setAttribute('stroke-linecap', 'round')
  progressArc.setAttribute('transform', `rotate(-90 ${circleX} ${circleY})`)
  svg.appendChild(progressArc)

  // Stage text
  const stageText = document.createElementNS(svgNS, 'text')
  stageText.setAttribute('x', circleX.toString())
  stageText.setAttribute('y', circleY.toString())
  stageText.setAttribute('text-anchor', 'middle')
  stageText.setAttribute('dominant-baseline', 'middle')
  stageText.setAttribute('font-size', '20px')
  stageText.setAttribute('font-weight', 'bold')
  stageText.setAttribute('fill', '#fff')
  stageText.setAttribute('font-family', 'Arial, sans-serif')
  stageText.textContent = product?.stage?.toUpperCase() || 'NO STAGE'
  svg.appendChild(stageText)

  // Progress percentage
  const percentText = document.createElementNS(svgNS, 'text')
  percentText.setAttribute('x', circleX.toString())
  percentText.setAttribute('y', (circleY + 30).toString())
  percentText.setAttribute('text-anchor', 'middle')
  percentText.setAttribute('dominant-baseline', 'middle')
  percentText.setAttribute('font-size', '16px')
  percentText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
  percentText.setAttribute('font-family', 'Arial, sans-serif')
  percentText.textContent = `${Math.round(progress * 100)}% Complete`
  svg.appendChild(percentText)

  return svg
}

const ExportChartPDF: React.FC<ExportChartPDFProps> = ({ product }) => {
  const handleExportPDF = async () => {
    const svgElement = generateChartSVG(product)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [600, 800],
    })

    await svg2pdf(svgElement, pdf, { x: 0, y: 0 })

    const fileName = product?.name
      ? `${product.name.replace(/\s+/g, '_')}.pdf`
      : 'chart.pdf'

    pdf.save(fileName)
  }

  return (
    <button className="btn btn-warning" onClick={handleExportPDF}>
      Export to PDF
    </button>
  )
}

export default ExportChartPDF
