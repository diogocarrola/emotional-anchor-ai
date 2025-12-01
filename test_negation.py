#!/usr/bin/env python3
"""
Test script for improved emotional detection with negation handling
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.emotional_anchor import EmotionalAnchorAI

def test_negation_handling():
    """Test the improved negation handling"""
    print("Testing improved emotional detection with negation handling...\n")

    anchor = EmotionalAnchorAI()

    test_cases = [
        ("I am not quite happy today", "sad"),
        ("I am not happy", "sad"),
        ("I am sad", "sad"),
        ("I'm feeling great!", "happy"),
        ("I'm not feeling sad today", "neutral"),  # This might be tricky
        ("This is not amazing at all", "sad"),
        ("I'm worried and not happy", "anxious"),  # Should prioritize anxious
        ("I'm grateful but not happy", "grateful"),  # Should prioritize grateful
    ]

    print("Test Results:")
    print("-" * 50)

    for message, expected in test_cases:
        detected = anchor.detect_emotional_state(message)
        status = "✓" if detected == expected else "✗"
        print(f"{status} '{message}' -> Detected: {detected} (Expected: {expected})")

    print("\n" + "=" * 50)
    print("Negation handling test complete!")

if __name__ == "__main__":
    test_negation_handling()
