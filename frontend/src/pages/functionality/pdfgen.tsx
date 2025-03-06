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

const wrapText = (text: string, maxLength: number): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= maxLength) {
      currentLine += ' ' + words[i]
    } else {
      lines.push(currentLine)
      currentLine = words[i]
    }
  }
  lines.push(currentLine)
  return lines
}

const generateChartSVG = (product: ProductData | null): SVGSVGElement => {
  const svgNS = 'http://www.w3.org/2000/svg'
  const width = 600
  const height = 800
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
  const headerHeight = 120
  const header = document.createElementNS(svgNS, 'rect')
  header.setAttribute('x', '0')
  header.setAttribute('y', '0')
  header.setAttribute('width', width.toString())
  header.setAttribute('height', headerHeight.toString())
  header.setAttribute('fill', 'rgba(0, 0, 0, 0.3)')
  svg.appendChild(header)

  // Main title
  const mainTitle = document.createElementNS(svgNS, 'text')
  mainTitle.setAttribute('x', '30')
  mainTitle.setAttribute('y', '50')
  mainTitle.setAttribute('fill', '#fff')
  mainTitle.setAttribute('font-size', '22px')
  mainTitle.setAttribute('font-weight', 'bold')
  mainTitle.setAttribute('font-family', 'Arial, sans-serif')
  mainTitle.textContent = 'ConceptoCar Product Development Report'
  svg.appendChild(mainTitle)

  // Product name subtitle
  const productTitle = document.createElementNS(svgNS, 'text')
  productTitle.setAttribute('x', '30')
  productTitle.setAttribute('y', '80')
  productTitle.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
  productTitle.setAttribute('font-size', '18px')
  productTitle.setAttribute('font-family', 'Arial, sans-serif')
  productTitle.textContent = product?.name || 'General Product Overview'
  svg.appendChild(productTitle)

  // Metadata section
  let metaY = 110
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
      metaY += 15
    }
    if (product.updated_at) {
      addMetaText(
        `Updated: ${new Date(product.updated_at).toLocaleDateString()}`,
        metaY
      )
      metaY += 15
    }
    if (product.createdBy) {
      addMetaText(`Created by: ${product.createdBy}`, metaY)
    }
  }

  // Footer section
  const footerHeight = 40
  const footer = document.createElementNS(svgNS, 'rect')
  footer.setAttribute('x', '0')
  footer.setAttribute('y', (height - footerHeight).toString())
  footer.setAttribute('width', width.toString())
  footer.setAttribute('height', footerHeight.toString())
  footer.setAttribute('fill', 'rgba(0, 0, 0, 0.3)')
  svg.appendChild(footer)

  const footerText = document.createElementNS(svgNS, 'text')
  footerText.setAttribute('x', (width / 2).toString())
  footerText.setAttribute('y', (height - 15).toString())
  footerText.setAttribute('text-anchor', 'middle')
  footerText.setAttribute('fill', 'rgba(255, 255, 255, 0.7)')
  footerText.setAttribute('font-size', '12px')
  footerText.setAttribute('font-family', 'Arial, sans-serif')
  footerText.textContent = 'ConceptoCar - Automotive Innovation Platform'
  svg.appendChild(footerText)

  // Content container
  const content = document.createElementNS(svgNS, 'rect')
  content.setAttribute('x', '20')
  content.setAttribute('y', '140')
  content.setAttribute('width', (width - 40).toString())
  content.setAttribute('height', (height - 140 - footerHeight - 20).toString())
  content.setAttribute('rx', '10')
  content.setAttribute('fill', 'rgba(255, 255, 255, 0.1)')
  svg.appendChild(content)

  // Product info section
  const margin = 40
  let textY = 160
  const lineHeight = 28
  const maxLineLength = 35

  const addTextLine = (
    label: string,
    value?: string | null,
    unit?: string | null,
    isDescription?: boolean
  ) => {
    if (!value) return

    if (isDescription) {
      const lines = wrapText(value, maxLineLength)
      lines.forEach((line, index) => {
        const group = document.createElementNS(svgNS, 'g')

        const labelText = document.createElementNS(svgNS, 'text')
        labelText.setAttribute('x', margin.toString())
        labelText.setAttribute('y', (textY + index * 20).toString())
        labelText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
        labelText.setAttribute('font-size', '14px')
        labelText.setAttribute('font-family', 'Arial, sans-serif')
        labelText.textContent = index === 0 ? `${label}:` : ''

        const valueText = document.createElementNS(svgNS, 'text')
        valueText.setAttribute('x', (margin + 100).toString())
        valueText.setAttribute('y', (textY + index * 20).toString())
        valueText.setAttribute('fill', '#fff')
        valueText.setAttribute('font-size', '14px')
        valueText.setAttribute('font-family', 'Arial, sans-serif')
        valueText.textContent = line

        group.appendChild(labelText)
        group.appendChild(valueText)
        svg.appendChild(group)
      })
      textY += lines.length * 20
      return
    }

    const group = document.createElementNS(svgNS, 'g')

    const labelText = document.createElementNS(svgNS, 'text')
    labelText.setAttribute('x', margin.toString())
    labelText.setAttribute('y', textY.toString())
    labelText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
    labelText.setAttribute('font-size', '14px')
    labelText.setAttribute('font-family', 'Arial, sans-serif')
    labelText.textContent = `${label}:`

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
    addTextLine('Description', product.description, undefined, true)
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
