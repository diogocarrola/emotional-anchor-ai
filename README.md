# Emotional Anchor AI ⚓🩵
*A learning project from Kaggle's 5-Day AI Agents Intensive Course*

## 🎯 About This Project
This is my capstone project for the AI Agents course. As a beginner in AI agents, I focused on building something meaningful that I could actually complete: an emotional support companion that detects feelings and offers kind responses.

## 📖 My Learning Journey
I started with zero experience in Google ADK and learned:
- How emotional detection works (with negation handling!)
- The basics of agent architecture
- Session management with conversation memory
- Where I struggled and what I'd do differently

## 🔧 What's Working
- ✅ Emotional detection with negation awareness ("not happy" → sad)
- ✅ Conversation memory and pattern tracking
- ✅ Simple, kind responses for different emotions
- ✅ Clean, runnable code structure

## 🚧 What I'm Still Learning
- Fully integrating Google ADK (I have a minimal example)
- Using Gemini models effectively in multi-agent systems
- Advanced agent orchestration

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/diogocarrola/emotional-anchor-ai.git

# Install dependencies
pip install -r requirements.txt

# Run the emotional anchor
python main.py
```

## 💭 How to Use

Just start talking! The AI will:
- Detect your emotional state from your messages
- Respond with appropriate support or celebration
- Remember our conversation patterns
- Provide emotional insights over time

Example conversations:
```
You: I'm feeling really down today...
⚓ Emotional Anchor: I'm here with you. Storms don't last forever, and neither will this feeling.

You: I just got amazing news!
⚓ Emotional Anchor: I'm so glad to share this joyful moment with you! Your happiness matters.
```

## 📁 Project Structure

- `agents/` - Core AI agents for emotional processing
- `tools/` - Custom tools for conversation management
- `data/` - Emotional pattern storage and analysis
- `main.py` - Primary application interface

## 🎯 Capstone Project

This project is submitted as part of the Kaggle 5-Day AI Agents Intensive Course, demonstrating:
- Multi-agent systems for emotional intelligence
- Custom tool development for conversation memory
- Session management for emotional pattern tracking
- Creative application of AI for mental health support