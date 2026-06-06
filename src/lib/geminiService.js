import { generateOfflineChatResponse, generateOfflineHosaResource } from './hosaFallbacks.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

export const HOSA_SYSTEM_PROMPT = `You are a HOSA (Health Occupations Students of America) study coach helping students prepare for SQT (Skill Testing) competitive events. Provide accurate, concise, and educational answers about medical terminology, pharmacology, health sciences, pathophysiology, nutrition, medical math, medical law & ethics, and other HOSA topics. Keep responses relevant to HOSA SQT competition preparation. Format clearly with markdown when helpful.`

function getEventKeyAndType(prompt) {
  const p = prompt.toLowerCase()
  let type = 'guide'
  if (p.includes('practice questions') || p.includes('mcqs') || p.includes('mcq')) {
    type = 'questions'
  } else if (p.includes('concept hierarchy') || p.includes('mind map') || p.includes('concept map')) {
    type = 'mindmap'
  }

  let eventKey = 'medical-terminology'
  if (p.includes('pharmacology')) {
    eventKey = 'pharmacology'
  } else if (p.includes('math')) {
    eventKey = 'medical-math'
  }

  return { eventKey, type }
}

async function groqRequest(messages) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1200,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API error ${res.status}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function callGemini(apiKey, prompt) {
  try {
    return await groqRequest([
      { role: 'system', content: HOSA_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])
  } catch (err) {
    console.warn('Groq API call failed, using offline fallback:', err.message)
    const { eventKey, type } = getEventKeyAndType(prompt)
    return generateOfflineHosaResource(eventKey, type)
  }
}

export async function callGeminiChat(apiKey, messages) {
  try {
    const groqMessages = [
      { role: 'system', content: HOSA_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]
    return await groqRequest(groqMessages)
  } catch (err) {
    console.warn('Groq Chat call failed, using offline fallback:', err.message)
    return generateOfflineChatResponse(messages)
  }
}
