import './App.css'
import { Button } from './components/ui/button'
import { FileUpload } from './components/file-upload'
import { Notification } from './components/notification'
import { useState } from 'react'
import { csvToJson, downloadJSON } from './utils/csvToJson'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setNotification({
      message: `Arquivo "${file.name}" carregado com sucesso!`,
      type: 'success',
      isVisible: true
    })
  }

  const handleError = (error: string) => {
    setNotification({
      message: error,
      type: 'error',
      isVisible: true
    })
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      setNotification({
        message: 'Por favor, selecione um arquivo CSV primeiro.',
        type: 'error',
        isVisible: true
      })
      return
    }

    setIsConverting(true)
    
    try {
      const content = await selectedFile.text()
      const jsonData = csvToJson(content, {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true
      })
      downloadJSON(jsonData, selectedFile.name)
      setNotification({
        message: `Conversão concluída! ${jsonData.length} registros convertidos.`,
        type: 'success',
        isVisible: true
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na conversão'
      setNotification({
        message: `Erro na conversão: ${errorMessage}`,
        type: 'error',
        isVisible: true
      })
    } finally {
      setIsConverting(false)
    }
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
            Converta agora <span className="font-semibold text-blue-400">CSV</span> para{' '}
            <span className="font-semibold text-emerald-400">JSON</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-lg mx-auto">
            Transforme seus arquivos de dados de forma rápida e sem esforço.
            Simples, rápido e confiável.
          </p>
        </div>
        <div className="space-y-6">
          <FileUpload 
            onFileSelect={handleFileSelect}
            onError={handleError}
          />
          {selectedFile && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-slate-400 text-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-white"
                  disabled={isConverting}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}
          {selectedFile && (
            <Button 
              variant="default" 
              size="lg"
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Convertendo...
                </div>
              ) : (
                'Converter para JSON'
              )}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Rápido</h4>
            <p className="text-sm text-slate-400">Conversão instantânea</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Seguro</h4>
            <p className="text-sm text-slate-400">Seus dados permanecem privados</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Simples</h4>
            <p className="text-sm text-slate-400">Interface fácil de usar</p>
          </div>
        </div>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </div>
  )
}

export default App
