import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  message: string;
  userId: string;
}

function detectMood(text: string): string {
  const lower = text.toLowerCase();
  const moods: Record<string, string[]> = {
    sad: ["sad", "depressed", "hopeless", "miserable", "down", "hurt", "pain"],
    happy: ["happy", "great", "wonderful", "amazing", "excited", "joy", "love"],
    anxious: ["anxious", "worried", "nervous", "scared", "stressed", "panic"],
    grateful: ["grateful", "thankful", "appreciate", "blessed", "fortunate"],
  };

  for (const [mood, keywords] of Object.entries(moods)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return mood;
    }
  }
  return "neutral";
}

async function getConversationContext(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("content, sender, detected_mood, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return "This is the start of our conversation.";
    }

    const reversedData = data.reverse();
    const context = reversedData
      .map(
        (msg: any) =>
          `${msg.sender === "user" ? "You" : "Anchor"} (${msg.detected_mood}): ${msg.content}`
      )
      .join("\n");

    return context;
  } catch (err) {
    console.error("Error fetching context:", err);
    return "Unable to fetch conversation history.";
  }
}

async function callGemini(context: string, userMessage: string) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured, using fallback response");
    return generateFallbackResponse(userMessage);
  }

  try {
    const systemPrompt = `You are Anchor, a compassionate AI companion. You provide emotional support, understanding, and thoughtful conversation. You remember the conversation history and respond with empathy, acknowledging the person's emotional journey. Keep responses concise (1-2 sentences), warm, and genuine. Never provide therapy or medical advice.

Conversation history:
${context}

Respond naturally to continue this conversation.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + "\n\nUser: " + userMessage,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      return generateFallbackResponse(userMessage);
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      generateFallbackResponse(userMessage);
    return text;
  } catch (err) {
    console.error("Error calling Gemini:", err);
    return generateFallbackResponse(userMessage);
  }
}

function generateFallbackResponse(userMessage: string): string {
  const mood = detectMood(userMessage);
  const responses: Record<string, string[]> = {
    sad: [
      "I'm here with you. These feelings are temporary, even though they feel heavy.",
      "You're not alone in this. I'm listening.",
      "It's okay to feel this way. I'm here to support you.",
    ],
    happy: [
      "I'm so glad you're experiencing joy! These moments matter.",
      "Your happiness is beautiful. I'm celebrating with you.",
      "This is wonderful! Tell me more about what's lighting you up.",
    ],
    anxious: [
      "Let's breathe together. You're safe, and I'm right here.",
      "I hear your worries. One step at a time.",
      "Your feelings are valid. We can work through this together.",
    ],
    grateful: [
      "Your gratitude is beautiful. It anchors you in what truly matters.",
      "I'm so glad you're recognizing these moments.",
      "Gratitude is a gift. Thank you for sharing it.",
    ],
    neutral: [
      "I'm listening. What's on your mind?",
      "I'm here, whenever you're ready to share.",
      "Tell me more. I'm all ears.",
    ],
  };

  const moodResponses = responses[mood] || responses.neutral;
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, userId }: RequestBody = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const context = await getConversationContext(supabase, userId);
    const response = await callGemini(context, message);

    const mood = detectMood(response);

    const { error: insertError } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId,
          content: response,
          sender: "anchor",
          detected_mood: mood,
        },
      ]);

    if (insertError) {
      console.error("Error storing response:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        response,
        mood,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in anchor-respond:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
