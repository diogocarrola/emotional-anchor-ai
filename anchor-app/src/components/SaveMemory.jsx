import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/SaveMemory.css'

export default function SaveMemory({ isOpen, onClose, conversations, user }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [feelings, setFeelings] = useState([])
  const [dates, setDates] = useState([])
  const [newFeeling, setNewFeeling] = useState('')
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const feelingOptions = ['grateful', 'happy', 'peaceful', 'proud', 'loved', 'hopeful', 'inspired', 'brave']

  const toggleFeeling = (feeling) => {
    setFeelings(feelings.includes(feeling) ? feelings.filter(f => f !== feeling) : [...feelings, feeling])
  }

  const addDate = () => {
    if (newDate && !dates.includes(newDate)) {
      setDates([...dates, newDate])
      setNewDate('')
    }
  }

  const removeDate = (date) => {
    setDates(dates.filter(d => d !== date))
  }

  const handleSaveMemory = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please add a title')
      return
    }

    setSaving(true)
    setError('')

    try {
      const conversationIds = conversations.map(c => c.id)

      const { error: dbError } = await supabase.from('memories').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        feelings: feelings.length > 0 ? feelings : [],
        special_dates: dates.length > 0 ? dates : [],
        conversation_ids: conversationIds.length > 0 ? conversationIds : [],
        backed_up_at: new Date().toISOString(),
      })

      if (dbError) throw dbError

      setTitle('')
      setDescription('')
      setFeelings([])
      setDates([])
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save memory')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="memory-modal-overlay" onClick={onClose}>
      <div className="memory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memory-modal-header">
          <h2>Save This Moment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSaveMemory} className="memory-form">
          <div className="form-group">
            <label htmlFor="title">Memory Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., A breakthrough moment..."
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">What made this special?</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share why this moment matters to you..."
              rows="3"
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>How did you feel?</label>
            <div className="feelings-grid">
              {feelingOptions.map(feeling => (
                <button
                  key={feeling}
                  type="button"
                  className={`feeling-btn ${feelings.includes(feeling) ? 'selected' : ''}`}
                  onClick={() => toggleFeeling(feeling)}
                >
                  {feeling}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date-input">Special dates to remember</label>
            <div className="date-input-group">
              <input
                id="date-input"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <button
                type="button"
                onClick={addDate}
                className="add-date-btn"
                disabled={!newDate}
              >
                Add
              </button>
            </div>
            {dates.length > 0 && (
              <div className="dates-list">
                {dates.map(date => (
                  <div key={date} className="date-tag">
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => removeDate(date)}
                      className="remove-date-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
