export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const model = "gemini-1.5-flash"; // ✅ 최신 모델로 교체
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

    const prompt = `
      한국어로 상식 퀴즈 5개를 JSON 배열 형태로 만들어줘.
      각 항목은 {question, options[4], answerIndex, explanation} 구조로 작성해줘.
      중복이나 오류 없이 명확한 객관식 퀴즈만 포함할 것.
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No valid response text from Gemini API");
    }

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const quizzes = JSON.parse(jsonStr);

    res.status(200).json({ quizzes });
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ error: err.message });
  }
}
