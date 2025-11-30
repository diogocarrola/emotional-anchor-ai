import random
from datetime import datetime

class EmotionalAnchorAI:
    def __init__(self):
        self.conversation_history = []
        self.user_mood_patterns = {}
        
        # Emotional support responses for different moods
        self.support_responses = {
            'sad': [
                "I'm here with you. Storms don't last forever, and neither will this feeling.",
                "Your feelings are completely valid. Let's anchor ourselves in this moment together.",
                "I'm holding space for you. You don't have to carry this weight alone.",
                "Even anchors face rough seas. What makes you feel steady right now?",
                "This moment is tough, but it's not your whole story. I believe in your resilience."
            ],
            'happy': [
                "I'm so glad to share this joyful moment with you! Your happiness matters.",
                "This is beautiful! Let's anchor this happy memory together.",
                "Your joy is contagious! Tell me more about what's lighting you up.",
                "I'm celebrating with you! These are the moments that make life wonderful.",
                "Your happiness anchors me too! Thank you for sharing this light."
            ],
            'anxious': [
                "Let's breathe together. In... and out... You're safe here.",
                "I'm your steady anchor. What's one small thing that feels manageable right now?",
                "Your feelings are waves - they rise and fall. I'm here through all of them.",
                "Let's focus on just this moment. What do you notice around you right now?",
                "I'm not going anywhere. We can sit with these feelings together."
            ],
            'neutral': [
                "I'm here, anchored and ready to listen whenever you need.",
                "How are you really feeling beneath the surface today?",
                "I'm present with you, in calm waters or stormy seas.",
                "Your everyday moments matter too. What's on your mind?",
                "I'm your steady companion through all of life's emotions."
            ]
        }
    
    def detect_emotional_state(self, user_message):
        """Simple but effective emotional state detection"""
        message_lower = user_message.lower()
        
        # Emotional keyword mapping
        emotional_indicators = {
            'sad': ['sad', 'depressed', 'hopeless', 'crying', 'miserable', 'can\'t go on', 'tired of'],
            'happy': ['happy', 'excited', 'joy', 'amazing', 'wonderful', 'great', 'blessed', 'lucky'],
            'anxious': ['anxious', 'worried', 'nervous', 'scared', 'panic', 'overwhelmed', 'stressed'],
            'grateful': ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate']
        }
        
        # Count matches for each emotional state
        emotion_scores = {}
        for emotion, keywords in emotional_indicators.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            # Return the emotion with highest score
            return max(emotion_scores.items(), key=lambda x: x[1])[0]
        else:
            return 'neutral'
    
    def generate_response(self, user_message, emotional_state):
        """Generate an emotionally appropriate response"""
        # Log this conversation
        self._log_conversation(user_message, emotional_state)
        
        # Select appropriate response
        if emotional_state in self.support_responses:
            response = random.choice(self.support_responses[emotional_state])
        else:
            response = random.choice(self.support_responses['neutral'])
        
        return response
    
    def _log_conversation(self, user_message, emotional_state):
        """Store conversation for emotional pattern tracking"""
        timestamp = datetime.now().isoformat()
        entry = {
            'timestamp': timestamp,
            'user_message': user_message,
            'emotional_state': emotional_state
        }
        self.conversation_history.append(entry)
        
        # Keep only last 50 conversations to manage memory
        if len(self.conversation_history) > 50:
            self.conversation_history = self.conversation_history[-50:]
    
    def get_emotional_summary(self):
        """Provide insight into user's emotional patterns"""
        if not self.conversation_history:
            return "We haven't shared many conversations yet. I'm here when you're ready."
        
        # Count emotional states
        emotion_counts = {}
        for entry in self.conversation_history:
            emotion = entry['emotional_state']
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        summary = "Looking at our conversations, I notice: "
        insights = []
        
        for emotion, count in emotion_counts.items():
            percentage = (count / len(self.conversation_history)) * 100
            insights.append(f"{(percentage):.1f}% {emotion} moments")
        
        return summary + ", ".join(insights) + ". I'm here through all of them."
