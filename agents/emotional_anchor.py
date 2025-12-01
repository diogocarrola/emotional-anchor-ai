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
        """Improved emotional state detection with negation handling"""
        message_lower = user_message.lower()

        # Emotional keyword mapping with weights
        emotional_indicators = {
            'sad': {
                'keywords': ['sad', 'depressed', 'hopeless', 'crying', 'miserable', 'unhappy', 'down', 'bleak'],
                'weight': 1
            },
            'happy': {
                'keywords': ['happy', 'excited', 'joy', 'amazing', 'wonderful', 'great', 'good', 'fantastic'],
                'weight': 1
            },
            'anxious': {
                'keywords': ['anxious', 'worried', 'nervous', 'scared', 'panic', 'overwhelmed', 'stressed'],
                'weight': 1
            },
            'grateful': {
                'keywords': ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate'],
                'weight': 1
            }
        }

        # Negation words that reverse the emotion
        negation_words = ['not', "don't", "doesn't", "isn't", "aren't", "wasn't", "weren't", "can't", "won't", "no", "never"]

        # Check for negations in the message
        has_negation = any(negation in message_lower for negation in negation_words)

        # Count matches for each emotional state with negation handling
        emotion_scores = {}

        for emotion, data in emotional_indicators.items():
            score = 0
            for keyword in data['keywords']:
                if keyword in message_lower:
                    # Check if this keyword is near a negation
                    words = message_lower.split()
                    keyword_index = -1
                    for i, word in enumerate(words):
                        if keyword in word:
                            keyword_index = i
                            break

                    # If we found the keyword, check for nearby negations
                    is_negated = False
                    if keyword_index != -1:
                        # Check 2-3 words before the keyword for negations
                        for i in range(max(0, keyword_index-3), keyword_index):
                            if i < len(words) and any(negation in words[i] for negation in negation_words):
                                is_negated = True
                                break

                    if is_negated:
                        # If negated, this might indicate the opposite emotion
                        if emotion == 'happy':
                            score -= 2  # Strong negative for negated happiness
                        elif emotion == 'sad':
                            score += 1  # Emphasize sadness if negating happy words
                    else:
                        score += data['weight']

            if score > 0:
                emotion_scores[emotion] = score

        # Special case: explicit sadness mentions (only if not negated)
        if 'sad' in message_lower:
            negation_near_sad = False
            words = message_lower.split()
            for i, word in enumerate(words):
                if 'sad' in word:
                    # Check if there's a negation within 2 words before 'sad'
                    for j in range(max(0, i-2), i):
                        if j < len(words) and any(negation in words[j] for negation in negation_words):
                            negation_near_sad = True
                            break
                    break
            if not negation_near_sad:
                emotion_scores['sad'] = emotion_scores.get('sad', 0) + 2

        # Special case: negated happiness (only apply if no other strong emotions)
        happy_words_in_message = any(word in message_lower for word in emotional_indicators['happy']['keywords'])
        if has_negation and happy_words_in_message and len([e for e in emotion_scores if e != 'happy']) == 0:
            emotion_scores['sad'] = emotion_scores.get('sad', 0) + 1
            if 'happy' in emotion_scores:
                emotion_scores['happy'] = max(0, emotion_scores['happy'] - 1)

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
