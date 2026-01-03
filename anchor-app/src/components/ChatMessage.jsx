import '../styles/ChatMessage.css'

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user'
  const mood = message.detected_mood || 'neutral'

  return (
    <div className={`message ${isUser ? 'user' : 'anchor'}`}>
      <div className={`message-content mood-${mood}`}>
        {isUser && <span className="mood-indicator" title={mood}>●</span>}
        <p>{message.content}</p>
        <span className="timestamp">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
