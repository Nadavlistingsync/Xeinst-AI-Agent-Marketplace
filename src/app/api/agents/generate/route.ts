import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { instruction, framework } = await req.json();
  if (!instruction || !framework) {
    return NextResponse.json({ error: 'Missing instruction or framework' }, { status: 400 });
  }

  const prompt = `You are an expert AI agent developer. Write a complete, production-ready ${framework} code for an agent as described: "${instruction}". Only output the code, no explanations.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful AI agent code generator.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });
    if (!openaiRes.ok) {
      return NextResponse.json({ error: 'OpenAI API error' }, { status: 500 });
    }
    const data = await openaiRes.json();
    const code = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ code });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
} 