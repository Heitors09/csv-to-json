export interface CSVRow {
  [key: string]: string | number
}

export interface ConversionOptions {
  delimiter?: string
  hasHeader?: boolean
  skipEmptyLines?: boolean
}

export function csvToJson(csvContent: string, options: ConversionOptions = {}): CSVRow[] {
  const {
    delimiter = ',',
    hasHeader = true,
    skipEmptyLines = true
  } = options

  // Dividir o conteúdo em linhas
  const lines = csvContent.split('\n')
  
  // Filtrar linhas vazias se necessário
  const filteredLines = skipEmptyLines 
    ? lines.filter(line => line.trim().length > 0)
    : lines

  if (filteredLines.length === 0) {
    throw new Error('Arquivo CSV vazio')
  }

  let headers: string[] = []
  let dataLines: string[]

  if (hasHeader) {
    // Primeira linha são os cabeçalhos
    headers = parseCSVLine(filteredLines[0], delimiter)
    dataLines = filteredLines.slice(1)
  } else {
    // Sem cabeçalhos, usar índices como chaves
    const firstDataLine = parseCSVLine(filteredLines[0], delimiter)
    headers = firstDataLine.map((_, index) => `column_${index + 1}`)
    dataLines = filteredLines
  }

  // Converter linhas de dados para objetos
  const jsonData: CSVRow[] = dataLines.map((line) => {
    const values = parseCSVLine(line, delimiter)
    const row: CSVRow = {}

    headers.forEach((header, headerIndex) => {
      const value = values[headerIndex] || ''
      
      // Tentar converter para número se possível
      const numValue = parseFloat(value)
      row[header] = isNaN(numValue) ? value : numValue
    })

    return row
  })

  return jsonData
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"'
        i++ // Pular próxima aspas
      } else {
        // Toggle aspas
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      // Fim do campo
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Adicionar último campo
  result.push(current.trim())
  
  return result
}

export function downloadJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename.replace(/\.csv$/i, '.json')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
} 