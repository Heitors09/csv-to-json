import React, { useState, useRef, useCallback } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onError?: (error: string) => void
}

export function FileUpload({ onFileSelect, onError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateCSVFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.CSV']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
    if (!validExtensions.includes(fileExtension)) {
      return false
    }
    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel'
    ]
    if (!validMimeTypes.includes(file.type) && file.type !== '') {
      return false
    }
    return true
  }

  const validateCSVContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          if (!content || content.trim().length === 0) {
            resolve(false)
            return
          }
          const lines = content.split('\n')
          const firstLine = lines[0]
          if (!firstLine.includes(',') && !firstLine.includes(';')) {
            resolve(false)
            return
          }
          if (lines.length < 2) {
            resolve(false)
            return
          }
          resolve(true)
        } catch (error) {
          resolve(false)
        }
      }
      reader.onerror = () => resolve(false)
      reader.readAsText(file)
    })
  }

  const processFile = async (file: File) => {
    setIsLoading(true)
    try {
      if (!validateCSVFile(file)) {
        throw new Error('Por favor, selecione um arquivo CSV válido (.csv)')
      }
      const isValidContent = await validateCSVContent(file)
      if (!isValidContent) {
        throw new Error('O arquivo não parece ser um CSV válido. Verifique se contém dados separados por vírgula.')
      }
      onFileSelect(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev - 1)
    if (dragCounter <= 1) {
      setIsDragOver(false)
    }
  }, [dragCounter])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/10 scale-105' 
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        )}
        <div className="text-center space-y-4">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-200
            ${isDragOver 
              ? 'bg-blue-500/20 scale-110' 
              : 'bg-gradient-to-br from-blue-500 to-emerald-500'
            }
          `}>
            {isDragOver ? (
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">
              {isDragOver ? 'Solte o arquivo aqui' : 'Arraste seu arquivo CSV aqui'}
            </h3>
            <p className="text-slate-400 text-sm">
              ou clique para selecionar um arquivo
            </p>
            <p className="text-xs text-slate-500">
              Apenas arquivos .csv são aceitos
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.CSV"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  )
} 