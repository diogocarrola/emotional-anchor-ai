from agents.emotional_anchor import EmotionalAnchorAI

def main():
    print("⚓ Emotional Anchor AI Initializing...")
    print("I'm your steady companion through life's emotional waves.")
    print("Type 'quit' to end our conversation.\n")
    
    anchor = EmotionalAnchorAI()
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                summary = anchor.get_emotional_summary()
                print(f"\n⚓ Emotional Anchor: {summary}")
                print("Remember - I'm always here when you need steady ground. Take care. 🩵")
                break
            
            if not user_input:
                print("⚓ Emotional Anchor: I'm listening...")
                continue
            
            # Detect emotional state and respond
            emotional_state = anchor.detect_emotional_state(user_input)
            response = anchor.generate_response(user_input, emotional_state)
            
            print(f"⚓ Emotional Anchor: {response}")
            
        except KeyboardInterrupt:
            print(f"\n\n⚓ Emotional Anchor: Thank you for sharing your time with me.")
            print("I'll be here whenever you need an anchor. Stay steady. 🩵")
            break
        except Exception as e:
            print(f"⚓ Emotional Anchor: I'm having trouble processing. Let's try again.")
            print("How are you feeling right now?")

if __name__ == "__main__":
    main()
