import { useEffect, useState, useRef } from 'react'
import './App.css'
import { Turno } from './models/turno'
import { turnosService } from './services/turnos-service'
import { TurnosList } from './components/turnos-list'
import { FaReact } from 'react-icons/fa'

function App() {
  const [turnos, setTurnos] = useState<(Turno & { isCustomCreated?: boolean })[]>([])
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [networkError, setNetworkError] = useState<string | null>(null)
  
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  const mainNameInputRef = useRef<HTMLInputElement>(null)
  const modalNameInputRef = useRef<HTMLInputElement>(null)

  const fetchLiveDatabaseContent = () => {
    setLoading(true)
    setNetworkError(null)
    
    turnosService.getAll()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((t: Turno) => ({ ...t, isCustomCreated: false }))
          setTurnos(mapped)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Network connection failed inside App.tsx hook context:", err)
        setNetworkError(err.message || "Failed to reach the API server.")
        setLoading(false)
      })
  }

  useEffect(() => {
    document.title = "Turnos Project"
    fetchLiveDatabaseContent()
  }, [])

  const handleForceCacheWipeReset = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) registration.unregister()
      })
    }
    window.location.reload()
  }

  useEffect(() => {
    if (selectedTurno !== null && modalNameInputRef.current) {
      modalNameInputRef.current.focus()
    }
  }, [selectedTurno])

  const triggerClosingFocusSequence = () => {
    setSelectedTurno(null)
    setTimeout(() => {
      if (mainNameInputRef.current) {
        mainNameInputRef.current.focus()
      }
    }, 50)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedTurno !== null) {
        triggerClosingFocusSequence()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedTurno])

  const handleAddTurno = async (name: string, phone: string) => {
    const numericIds = turnos.map(t => parseInt(t.id, 10)).filter(id => !isNaN(id))
    const nextSequentialId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
    const stringId = String(nextSequentialId)

    try {
      await turnosService.add({ name, phone })
      setTurnos([...turnos, { id: stringId, name, phone, isCustomCreated: true }])
    } catch (err) {
      setTurnos([...turnos, { id: stringId, name, phone, isCustomCreated: true }])
    }
  }

  const handleOpenModal = (turno: Turno) => {
    setSelectedTurno(turno)
    setEditName(turno.name)
    setEditPhone(turno.phone)
  }

  const handleUpdateTurno = async () => {
    if (!selectedTurno) return
    const updatedTurno = { id: selectedTurno.id, name: editName, phone: editPhone, isCustomCreated: true }
    
    try {
      await turnosService.update(updatedTurno)
      setTurnos(turnos.map(t => t.id === selectedTurno.id ? updatedTurno : t))
      triggerClosingFocusSequence()
    } catch (err) {
      setTurnos(turnos.map(t => t.id === selectedTurno.id ? updatedTurno : t))
      triggerClosingFocusSequence()
    }
  }

  const handleRemoveTurno = async (id: string) => {
    try {
      await turnosService.delete(id)
      setTurnos(turnos.filter(t => t.id !== id))
    } catch (err) {
      setTurnos(turnos.filter(t => t.id !== id))
    } finally {
      if (mainNameInputRef.current) {
        mainNameInputRef.current.focus()
      }
    }
  }

  return (
    <div className="app-container">
      <header className="brand-header">
        <div className="brand-logo-container">
          <FaReact className="react-icon-svg" />
          <span className="brand-text">React</span>
        </div>
      </header>

      <div className="project-title-container">
        <h1 className="project-main-title">Turnos Project</h1>
      </div>
      
      {loading ? (
        <div className="loading-status-text">Loading live appointments data from server...</div>
      ) : networkError ? (
        <div className="network-error-banner">
          <p>⚠️ <strong>Network Error:</strong> {networkError}</p>
          <button 
            type="button" 
            onClick={handleForceCacheWipeReset}
            style={{ marginTop: '1rem', backgroundColor: '#dc2626', color: '#ffffff', border: 'none' }}
          >
            Force Clear App Cache
          </button>
        </div>
      ) : (
        <TurnosList 
          turnos={turnos}
          onAddTurno={handleAddTurno}
          onSelectView={handleOpenModal}
          onRemoveTurno={handleRemoveTurno}
          customNameRef={mainNameInputRef}
        />
      )}

      {selectedTurno && (
        <div className="modal-overlay" onClick={triggerClosingFocusSequence}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">View Turno</h5>
              <button type="button" className="close" onClick={triggerClosingFocusSequence}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <label>ID:</label>
                <input type="text" value={selectedTurno.id} readOnly />
              </div>

              <div className="modal-row">
                <label>NAME:</label>
                <input 
                  type="text" 
                  ref={modalNameInputRef}
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                />
              </div>

              <div className="modal-row">
                <label>PHONE:</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-action btn-view" onClick={handleUpdateTurno}>
                UPDATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App