const Groq = require("groq-sdk");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "messages array is required and cannot be empty",
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Convert Gemini format to Groq/OpenAI format
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.parts?.[0]?.text ?? msg.content ?? "",
    }));

    const systemPrompt = `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || "N/A"}
[PROBLEM_DESCRIPTION]: ${description || "N/A"}
[EXAMPLES]: ${testCases || "N/A"}
[startCode]: ${startCode || "N/A"}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics
- If asked about unrelated topics, politely redirect to the current problem

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // free & powerful
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages,
      ],
      max_tokens: 1024,
    });

    const replyText = response.choices[0].message.content;

    res.status(200).json({
      message: replyText,
    });

  } catch (err) {
    console.error("solveDoubt error:", err.message);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = solveDoubt;