import React, { useState, useEffect } from 'react'
import { Turno } from '../models/turno'

interface TurnosListProps {
  turnos: (Turno & { isCustomCreated?: boolean })[]
  onAddTurno: (name: string, phone: string) => void
  onSelectView: (turno: Turno) => void
  onRemoveTurno: (id: string) => void
  customNameRef: React.RefObject<HTMLInputElement | null>
}

export const TurnosList: React.FC<TurnosListProps> = ({ 
  turnos, 
  onAddTurno, 
  onSelectView, 
  onRemoveTurno,
  customNameRef
}) => {
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    if (customNameRef.current) {
      customNameRef.current.focus()
    }
  }, [customNameRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) return
    onAddTurno(newName, newPhone)
    setNewName('')
    setNewPhone('')
    
    if (customNameRef.current) {
      customNameRef.current.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>PHONE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id}>
              <td>{turno.id}</td>
              <td>{turno.name}</td>
              <td>{turno.phone}</td>
              <td>
                {turno.isCustomCreated && (
                  <>
                    <button 
                      type="button" 
                      className="btn-action btn-view" 
                      onClick={() => onSelectView(turno)}
                    >
                      VIEW
                    </button>
                    <button 
                      type="button" 
                      className="btn-action btn-delete" 
                      onClick={() => onRemoveTurno(turno.id)}
                    >
                      DELETE
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>
              <input 
                type="text" 
                ref={customNameRef}
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
              />
            </td>
            <td>
              <input 
                type="text" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
                required 
              />
            </td>
            <td>
              <button type="submit">ADD</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </form>
  )
}