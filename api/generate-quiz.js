export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `다양한 주제(역사, 과학, 문학, 예술, 경제, 철학 등)의 상식 퀴즈 5개를 생성해주세요. 
각 문제는 4지선다형이며, 난이도는 중상 수준입니다.

반드시 아래 JSON 형식으로만 응답해주세요 (다른 설명이나 마크다운 코드블록 없이):
[
  {
    "question": "문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "answer": 0,
    "explanation": "상세한 해설"
  }
]`
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('API 응답 형식 오류');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    const cleanContent = content.replace(/```json|```/g, '').trim();
    const quizzes = JSON.parse(cleanContent);
    
    return res.status(200).json({ success: true, quizzes });
    
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
