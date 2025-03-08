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
  stageHistory?: StageHistory[]
  history?: [stageHistory: StageHistory[]]
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

const wrapText = (text: any, maxWidth: number, fontSize: number): string[] => {
  const textStr = typeof text === 'string' ? text : String(text)
  const words = textStr.split(' ')
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
  const width = 595
  const height = 842

  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('id', 'chart-svg')
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())

  // Background gradient
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

  const background = document.createElementNS(svgNS, 'rect')
  background.setAttribute('x', '0')
  background.setAttribute('y', '0')
  background.setAttribute('width', width.toString())
  background.setAttribute('height', height.toString())
  background.setAttribute('fill', 'url(#background-gradient)')
  svg.appendChild(background)

  // Header
  const headerHeight = 100
  const header = document.createElementNS(svgNS, 'rect')
  header.setAttribute('x', '0')
  header.setAttribute('y', '0')
  header.setAttribute('width', width.toString())
  header.setAttribute('height', headerHeight.toString())
  header.setAttribute('fill', 'rgba(0, 40, 60, 0.85)')
  svg.appendChild(header)

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

  // Metadata
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

  // Content area
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

  // Product information
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

    const labelEl = document.createElementNS(svgNS, 'text')
    labelEl.setAttribute('x', labelX.toString())
    labelEl.setAttribute('y', textY.toString())
    labelEl.setAttribute('fill', 'rgba(255, 255, 255, 0.85)')
    labelEl.setAttribute('font-size', '14px')
    labelEl.setAttribute('font-family', 'Arial, sans-serif')
    labelEl.textContent = `${label}:`
    svg.appendChild(labelEl)

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
    addTextBlock('Estimated Weight', product.estimated_weight, 'kg')
    addTextBlock('Estimated Length', product.estimated_length, 'cm')
    addTextBlock('Estimated Height', product.estimated_height, 'cm')
    addTextBlock('Estimated Width', product.estimated_width, 'cm')
  }

  // Materials Used
  if (product) {
    const pdftimestamp = document.createElementNS(svgNS, 'text')
    pdftimestamp.setAttribute('x', labelX.toString())
    pdftimestamp.setAttribute('y', textY.toString())
    pdftimestamp.setAttribute('fill', '#fff')
    pdftimestamp.setAttribute('font-size', '14px')
    pdftimestamp.setAttribute('font-family', 'Arial, sans-serif')
    pdftimestamp.textContent = `PDF TIMESTAMP - ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    svg.appendChild(pdftimestamp)
    textY += 25
  }

  // Stage History
  if (product) {
    textY += 20
    let stageHistory: StageHistory[] = []
    if ((product as any).stageHistory) {
      stageHistory = (product as any).stageHistory
    } else if (Array.isArray((product as any).history)) {
      stageHistory = (product as any).history
    } else if (
      (product as any).history &&
      Array.isArray((product as any).history.stageHistory)
    ) {
      stageHistory = (product as any).history.stageHistory
    }

    if (stageHistory.length > 0) {
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

  // Dynamic chart positioning
  const chartRadius = 50
  const strokeWidth = 9
  const chartVerticalSpacing = 50

  const chartCenterY = textY / 2 + chartVerticalSpacing
  const chartCenterX = contentX + 400

  // Progress chart
  const chartGroup = document.createElementNS(svgNS, 'g')
  const circumference = 2 * Math.PI * chartRadius

  const trackCircle = document.createElementNS(svgNS, 'circle')
  trackCircle.setAttribute('cx', chartCenterX.toString())
  trackCircle.setAttribute('cy', chartCenterY.toString())
  trackCircle.setAttribute('r', chartRadius.toString())
  trackCircle.setAttribute('fill', 'none')
  trackCircle.setAttribute('stroke', '#555')
  trackCircle.setAttribute('stroke-width', strokeWidth.toString())
  chartGroup.appendChild(trackCircle)

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

  // Footer
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
    console.log('Exporting PDF for:', product)
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

    // Set up links – white text, with white underline.
    let linkX = 85 // starting X coordinate
    const linkY = 700 // Y coordinate for links

    pdf.setFontSize(14)
    pdf.setTextColor(255, 255, 255) // white text for links
    pdf.setDrawColor(255, 255, 255) // white color for underline
    pdf.setLineWidth(0.5)

    // Link 1: "View Product Page"
    const linkText1 = 'View Product Page'
    pdf.textWithLink(linkText1, linkX, linkY, { url: productURL })
    const textWidth1 = pdf.getTextWidth(linkText1)
    pdf.line(linkX, linkY + 2, linkX + textWidth1, linkY + 2)

    // Link 2: "View Materials Page"
    linkX += 175
    const linkText2 = 'View Materials Page'
    pdf.textWithLink(linkText2, linkX, linkY, { url: materialsURL })
    const textWidth2 = pdf.getTextWidth(linkText2)
    pdf.line(linkX, linkY + 2, linkX + textWidth2, linkY + 2)

    // Link 3: "Go to Homepage"
    linkX += 175
    const linkText3 = 'Go to Homepage'
    pdf.textWithLink(linkText3, linkX, linkY, { url: homeURL })
    const textWidth3 = pdf.getTextWidth(linkText3)
    pdf.line(linkX, linkY + 2, linkX + textWidth3, linkY + 2)

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
