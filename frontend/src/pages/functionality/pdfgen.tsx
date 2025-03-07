/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface StageHistory {
  _id: string
  stage: Stage
  product_id: string
  start_of_stage: string
  name: string
}

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
  // Support both response types:
  stageHistory?: StageHistory[]
  history?: {
    stageHistory: StageHistory[]
  }
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
  active: '#3633ec',
  inactive: '#F44336',
  standby: '#FFC107',
  default: '#9E9E9E',
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// This helper splits the text into multiple lines based on maxWidth
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
  if (currentLine) lines.push(currentLine.trim())
  return lines
}

const generateChartSVG = (product: ProductData | null): SVGSVGElement => {
  const svgNS = 'http://www.w3.org/2000/svg'
  const width = 595 // A4 width in px
  const height = 842 // A4 height in px

  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('id', 'chart-svg')
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())

  // ---------------------------
  // 1) BACKGROUND GRADIENT
  // ---------------------------
  const defs = document.createElementNS(svgNS, 'defs')
  const gradient = document.createElementNS(svgNS, 'linearGradient')
  gradient.setAttribute('id', 'background-gradient')
  gradient.setAttribute('x1', '0%')
  gradient.setAttribute('y1', '0%')
  gradient.setAttribute('x2', '100%')
  gradient.setAttribute('y2', '100%')
  const stops = [
    { offset: '0%', color: '#021124' },
    { offset: '50%', color: '#0e454a' },
    { offset: '100%', color: '#021124' },
  ]
  stops.forEach((stop) => {
    const stopEl = document.createElementNS(svgNS, 'stop')
    stopEl.setAttribute('offset', stop.offset)
    stopEl.setAttribute('stop-color', stop.color)
    gradient.appendChild(stopEl)
  })
  defs.appendChild(gradient)
  svg.appendChild(defs)

  // Background rectangle with gradient fill
  const background = document.createElementNS(svgNS, 'rect')
  background.setAttribute('x', '0')
  background.setAttribute('y', '0')
  background.setAttribute('width', width.toString())
  background.setAttribute('height', height.toString())
  background.setAttribute('fill', 'url(#background-gradient)')
  svg.appendChild(background)

  // ---------------------------
  // 2) HEADER SECTION
  // ---------------------------
  const headerHeight = 100
  const header = document.createElementNS(svgNS, 'rect')
  header.setAttribute('x', '0')
  header.setAttribute('y', '0')
  header.setAttribute('width', width.toString())
  header.setAttribute('height', headerHeight.toString())
  header.setAttribute('fill', 'rgba(0, 40, 60, 0.85)')
  svg.appendChild(header)

  // Company Branding
  const logoText = document.createElementNS(svgNS, 'text')
  logoText.setAttribute('x', '40')
  logoText.setAttribute('y', '50')
  logoText.setAttribute('fill', '#fff')
  logoText.setAttribute('font-size', '26px')
  logoText.setAttribute('font-family', 'Arial, sans-serif')
  logoText.setAttribute('font-weight', 'bold')
  logoText.textContent = 'CONCEPTOCAR'
  svg.appendChild(logoText)

  const reportTitle = document.createElementNS(svgNS, 'text')
  reportTitle.setAttribute('x', '40')
  reportTitle.setAttribute('y', '80')
  reportTitle.setAttribute('fill', 'rgba(255, 255, 255, 0.9)')
  reportTitle.setAttribute('font-size', '18px')
  reportTitle.setAttribute('font-family', 'Arial, sans-serif')
  reportTitle.textContent = 'Product Development Report'
  svg.appendChild(reportTitle)

  // ---------------------------
  // 3) METADATA (TOP RIGHT)
  // ---------------------------
  const metadataGroup = document.createElementNS(svgNS, 'g')
  let metaY = 30
  const addMetadata = (label: string, value?: string) => {
    if (!value) return
    const metaText = document.createElementNS(svgNS, 'text')
    metaText.setAttribute('x', (width - 220).toString())
    metaText.setAttribute('y', metaY.toString())
    metaText.setAttribute('fill', '#fff')
    metaText.setAttribute('font-size', '12px')
    metaText.setAttribute('font-family', 'Arial, sans-serif')
    metaText.innerHTML = `<tspan font-weight="bold">${label}:</tspan> ${value}`
    metadataGroup.appendChild(metaText)
    metaY += 18
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
  svg.appendChild(metadataGroup)

  // ---------------------------
  // 4) CONTENT AREA
  // ---------------------------
  const contentX = 40
  const contentY = headerHeight + 20
  const contentWidth = width - 80
  const contentHeight = height - headerHeight - 100

  const contentBg = document.createElementNS(svgNS, 'rect')
  contentBg.setAttribute('x', contentX.toString())
  contentBg.setAttribute('y', contentY.toString())
  contentBg.setAttribute('width', contentWidth.toString())
  contentBg.setAttribute('height', contentHeight.toString())
  contentBg.setAttribute('rx', '8')
  contentBg.setAttribute('fill', 'rgba(255, 255, 255, 0.1)')
  svg.appendChild(contentBg)

  // ---------------------------
  // 5) PRODUCT INFORMATION
  // ---------------------------
  let textY = contentY + 30
  const labelX = contentX + 20
  const valueX = labelX + 140
  const textSpacing = 25
  const maxTextWidth = contentWidth - 180

  const addTextBlock = (
    label: string,
    value?: string | null,
    unit?: string | null
  ) => {
    if (!value) return

    // Label
    const labelEl = document.createElementNS(svgNS, 'text')
    labelEl.setAttribute('x', labelX.toString())
    labelEl.setAttribute('y', textY.toString())
    labelEl.setAttribute('fill', 'rgba(255, 255, 255, 0.85)')
    labelEl.setAttribute('font-size', '14px')
    labelEl.setAttribute('font-family', 'Arial, sans-serif')
    labelEl.textContent = `${label}:`
    svg.appendChild(labelEl)

    // Value (wrapped if needed)
    // For Stage we capitalize the value
    const displayValue = label === 'Stage' ? capitalize(value) : value
    const fullText = unit ? `${displayValue} ${unit}` : displayValue
    const lines = wrapText(fullText, maxTextWidth, 14)
    lines.forEach((line, index) => {
      const valueEl = document.createElementNS(svgNS, 'text')
      valueEl.setAttribute('x', valueX.toString())
      valueEl.setAttribute('y', (textY + index * 18).toString())
      valueEl.setAttribute('fill', '#fff')
      valueEl.setAttribute('font-size', '14px')
      valueEl.setAttribute('font-family', 'Arial, sans-serif')
      valueEl.textContent = line
      svg.appendChild(valueEl)
    })
    textY += lines.length * 18 + textSpacing
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

  // ---------------------------
  // 6) MATERIALS USED (Clickable Link)
  // ---------------------------
  if (product) {
    const materialsUsed = Math.floor(Math.random() * 100) + 1
    const materialsText = document.createElementNS(svgNS, 'text')
    materialsText.setAttribute('x', labelX.toString())
    materialsText.setAttribute('y', textY.toString())
    materialsText.setAttribute('fill', '#fff') // Changed to white
    materialsText.setAttribute('font-size', '14px')
    materialsText.setAttribute('font-family', 'Arial, sans-serif')
    materialsText.textContent = `Materials Used: ${materialsUsed}`
    svg.appendChild(materialsText)
    textY += 25
  }

  // ---------------------------
  // 7) STAGE HISTORY SECTION (Moved Lower)
  // ---------------------------
  if (product) {
    // Add extra offset before stage history
    textY += 20
    // Extract stage history from both variants
    const stageHistory: StageHistory[] =
      (product as any).stageHistory ||
      ((product as any).history && (product as any).history.stageHistory) ||
      []

    if (Array.isArray(stageHistory) && stageHistory.length > 0) {
      // Section header
      const historyHeader = document.createElementNS(svgNS, 'text')
      historyHeader.setAttribute('x', labelX.toString())
      historyHeader.setAttribute('y', textY.toString())
      historyHeader.setAttribute('fill', 'rgba(255, 255, 255, 0.9)')
      historyHeader.setAttribute('font-size', '16px')
      historyHeader.setAttribute('font-family', 'Arial, sans-serif')
      historyHeader.setAttribute('font-weight', 'bold')
      historyHeader.textContent = 'Stage History:'
      svg.appendChild(historyHeader)
      textY += 25

      // List each stage history entry
      stageHistory.forEach((item) => {
        const stageDate = new Date(item.start_of_stage).toLocaleDateString()
        const lineText = `Started stage: ${capitalize(item.stage)} by ${
          item.name
        } on ${stageDate}`

        const historyItemEl = document.createElementNS(svgNS, 'text')
        historyItemEl.setAttribute('x', labelX.toString())
        historyItemEl.setAttribute('y', textY.toString())
        historyItemEl.setAttribute('fill', '#fff')
        historyItemEl.setAttribute('font-size', '14px')
        historyItemEl.setAttribute('font-family', 'Arial, sans-serif')
        historyItemEl.textContent = lineText
        svg.appendChild(historyItemEl)
        textY += 18
      })
    }
  }

  // ---------------------------
  // 8) ROUND PROGRESS CHART
  //    (Placed near the bottom-left of content area)
  // ---------------------------
  const chartGroup = document.createElementNS(svgNS, 'g')
  const chartCenterX = contentX + 400
  const chartCenterY = contentY + contentHeight - 450
  const chartRadius = 50
  const strokeWidth = 9
  const circumference = 2 * Math.PI * chartRadius

  // Track circle (background)
  const trackCircle = document.createElementNS(svgNS, 'circle')
  trackCircle.setAttribute('cx', chartCenterX.toString())
  trackCircle.setAttribute('cy', chartCenterY.toString())
  trackCircle.setAttribute('r', chartRadius.toString())
  trackCircle.setAttribute('fill', 'none')
  trackCircle.setAttribute('stroke', '#555')
  trackCircle.setAttribute('stroke-width', strokeWidth.toString())
  chartGroup.appendChild(trackCircle)

  // Progress logic
  const currentStage = (product?.stage as Stage) || 'default'
  const activeStages: Stage[] = [
    'concept',
    'feasibility',
    'design',
    'production',
  ]
  const isActive = activeStages.includes(currentStage)

  let progress = 0
  if (isActive) {
    progress = stagesOrder.indexOf(currentStage) / (activeStages.length - 1)
  }

  let strokeColor = STATUS_COLORS.default
  if (isActive) {
    strokeColor = STATUS_COLORS.active
  } else if (['standby', 'withdrawal'].includes(currentStage)) {
    strokeColor = STATUS_COLORS.standby
  } else if (currentStage === 'cancelled') {
    strokeColor = STATUS_COLORS.inactive
  }

  // Progress arc
  const progressCircle = document.createElementNS(svgNS, 'circle')
  progressCircle.setAttribute('cx', chartCenterX.toString())
  progressCircle.setAttribute('cy', chartCenterY.toString())
  progressCircle.setAttribute('r', chartRadius.toString())
  progressCircle.setAttribute('fill', 'none')
  progressCircle.setAttribute('stroke', strokeColor)
  progressCircle.setAttribute('stroke-width', strokeWidth.toString())
  progressCircle.setAttribute('stroke-linecap', 'round')
  const dashLength = progress * circumference
  const gapLength = circumference - dashLength
  progressCircle.setAttribute('stroke-dasharray', `${dashLength} ${gapLength}`)
  progressCircle.setAttribute(
    'transform',
    `rotate(-90 ${chartCenterX} ${chartCenterY})`
  )
  chartGroup.appendChild(progressCircle)

  // Percentage text in the center of the circle
  const percentText = document.createElementNS(svgNS, 'text')
  percentText.setAttribute('x', chartCenterX.toString())
  percentText.setAttribute('y', (chartCenterY + 5).toString())
  percentText.setAttribute('text-anchor', 'middle')
  percentText.setAttribute('dominant-baseline', 'middle')
  percentText.setAttribute('fill', strokeColor)
  percentText.setAttribute('font-size', '16px')
  percentText.setAttribute('font-weight', 'bold')
  percentText.setAttribute('font-family', 'Arial, sans-serif')
  if (!['standby', 'withdrawal', 'cancelled'].includes(currentStage)) {
    percentText.textContent = `${Math.round(progress * 100)}%`
  } else {
    percentText.setAttribute('font-size', '8.4px')
    percentText.textContent = `Inactive \n Development`
  }
  chartGroup.appendChild(percentText)

  // Status label below the circle
  const statusText = isActive
    ? 'Progress'
    : ['standby', 'withdrawal'].includes(currentStage)
    ? 'Inactive'
    : currentStage === 'cancelled'
    ? 'Terminated'
    : 'Inactive'
  const statusLabel = document.createElementNS(svgNS, 'text')
  statusLabel.setAttribute('x', chartCenterX.toString())
  statusLabel.setAttribute('y', (chartCenterY + chartRadius + 30).toString())
  statusLabel.setAttribute('text-anchor', 'middle')
  statusLabel.setAttribute('fill', strokeColor)
  statusLabel.setAttribute('font-size', '12px')
  statusLabel.setAttribute('font-family', 'Arial, sans-serif')
  statusLabel.textContent = statusText
  chartGroup.appendChild(statusLabel)

  svg.appendChild(chartGroup)

  // ---------------------------
  // 9) FOOTER SECTION
  // ---------------------------
  const footerHeight = 60
  const footer = document.createElementNS(svgNS, 'rect')
  footer.setAttribute('x', '0')
  footer.setAttribute('y', (height - footerHeight).toString())
  footer.setAttribute('width', width.toString())
  footer.setAttribute('height', footerHeight.toString())
  footer.setAttribute('fill', 'rgba(0, 40, 60, 0.85)')
  svg.appendChild(footer)

  const footerText = document.createElementNS(svgNS, 'text')
  footerText.setAttribute('x', (width / 2).toString())
  footerText.setAttribute('y', (height - 20).toString())
  footerText.setAttribute('text-anchor', 'middle')
  footerText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)')
  footerText.setAttribute('font-size', '12px')
  footerText.setAttribute('font-family', 'Arial, sans-serif')
  footerText.textContent = `Confidential Document - ${new Date().toLocaleDateString()} - ConceptToCar`
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

    const baseURL = 'http://localhost:5173'
    const productURL = `${baseURL}/product/${product?.name}/${product?._id}`
    const materialsURL = `${productURL}/materials`
    const homeURL = baseURL

    // Add clickable links using jsPDF's textWithLink (adjust coordinates as needed)
    let linkX = 85 // X coordinate for the links
    const linkY = 700 // starting Y coordinate for the first link

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 255) // Blue color for clickable links
    pdf.textWithLink('View Product Page', linkX, linkY, { url: productURL })
    linkX += 175
    pdf.textWithLink('View Materials Page', linkX, linkY, { url: materialsURL })
    linkX += 175
    pdf.textWithLink('Go to Homepage', linkX, linkY, { url: homeURL })
    const fileName = product?.name
      ? `${product.name.replace(/\s+/g, '_')}_Report_${new Date()
          .toISOString()
          .slice(0, 10)}_${Math.random().toString(32)}.pdf`
      : `ConceptoCar_Report_${new Date()
          .toISOString()
          .slice(0, 10)}_${Math.random()
          .toString(36)
          .substring(2, 15)}_${Math.random().toString(32)}.pdf`

    pdf.save(fileName)
  }

  return (
    <button className="btn btn-warning" onClick={handleExportPDF}>
      Export To PDF
    </button>
  )
}

export default ExportChartPDF
