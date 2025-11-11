import { useState, useEffect } from 'react'
import './App.css'

interface Media {
  id: number
  name: string
  description: string
  fileUrl: string
}

function App() {
  const [count, setCount] = useState(0)
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = 'http://localhost:5152/api/media'

  // Carregar mídias da API
  const fetchMedia = async () => {
    setLoading(true)
    try {
      const response = await fetch(API_BASE_URL)
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
        console.log('Mídias carregadas:', data)
      } else {
        console.error('Erro ao carregar mídias')
      }
    } catch (error) {
      console.error('Erro de conexão com a API:', error)
      alert('Erro ao conectar com a API. Verifique se está rodando na porta 5152')
    } finally {
      setLoading(false)
    }
  }

  // Carregar mídias quando o componente montar
  useEffect(() => {
    fetchMedia()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Media API</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        
        <button onClick={fetchMedia} style={{ marginLeft: '10px' }}>
          {loading ? 'Carregando...' : 'Recarregar Mídias'}
        </button>
      </div>

      {/* Lista de Mídias */}
      <div className="card">
        <h3>Arquivos de Mídia ({media.length})</h3>
        
        {loading && <p>Carregando mídias da API...</p>}
        
        {!loading && media.length === 0 && (
          <p>Nenhum arquivo de mídia encontrado</p>
        )}
        
        {!loading && media.map((item) => (
          <div key={item.id} style={{ 
            border: '1px solid #646cff', 
            padding: '15px', 
            margin: '10px 0',
            borderRadius: '8px',
            backgroundColor: 'rgba(100, 108, 255, 0.1)'
          }}>
            <h4>{item.name || 'Sem nome'}</h4>
            <p><strong>Descrição:</strong> {item.description || 'Sem descrição'}</p>
            <p><strong>ID:</strong> {item.id}</p>
            {item.fileUrl && (
              <a 
                href={`http://localhost:5152/${item.fileUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#646cff',
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '5px 10px',
                  border: '1px solid #646cff',
                  borderRadius: '4px'
                }}
              >
                🔗 Ver Arquivo
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="read-the-docs">
        Clique nos logos do Vite e React para aprender mais
      </p>
    </>
  )
}

export default App