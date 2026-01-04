import { useEffect, useState, useRef } from 'react'
import { useAuthStore, useChatStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import ChatMessage from '../components/ChatMessage'
import '../styles/ChatPage.css'

export default function ChatPage() {
  const { user, signOut } = useAuthStore()
  const { conversations, fetchConversations, addConversation, loading } = useChatStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations(user.id)
    }
  }, [user, fetchConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations])

  const detectMood = (text) => {
    const text_lower = text.toLowerCase()
    const moods = {
      sad: ['sad', 'depressed', 'hopeless', 'miserable', 'down'],
      happy: ['happy', 'great', 'wonderful', 'amazing', 'excited'],
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'stressed'],
      grateful: ['grateful', 'thankful', 'appreciate', 'blessed'],
    }

    for (const [mood, keywords] of Object.entries(moods)) {
      if (keywords.some((kw) => text_lower.includes(kw))) {
        return mood
      }
    }
    return 'neutral'
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    try {
      const mood = detectMood(input)
      await addConversation(user.id, input, 'user', mood)
      setInput('')

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anchor-respond`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId: user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get response from Anchor')
      }

      await addConversation(
        user.id,
        result.response,
        'anchor',
        result.mood || 'supportive'
      )
    } catch (error) {
      console.error('Error sending message:', error)
      await addConversation(
        user.id,
        "I'm having trouble connecting right now. Please try again in a moment.",
        'anchor',
        'neutral'
      )
    } finally {
      setSending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setShowMenu(false)
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>⚓ Anchor</h1>
        <div className="header-actions">
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            title="Menu"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={handleSignOut} className="menu-item">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="messages-area">
        {loading ? (
          <div className="loading">Loading your conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <p>Welcome to Anchor. Start a conversation whenever you're ready.</p>
          </div>
        ) : (
          conversations.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what's on your mind..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          {sending ? '⟳' : 'Send'}
        </button>
      </form>
    </div>
  )
}
