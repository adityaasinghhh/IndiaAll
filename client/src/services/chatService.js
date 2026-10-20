import { api } from './api.js'

const MAX_MESSAGE_LENGTH = 1000

/**
 * Send a chat message to the INDIA ALL support assistant.
 * Returns { response: string } from POST /api/v1/chat.
 */
export async function sendChatMessage({ message, conversationHistory = [] }) {
  if (!message || !message.trim()) {
    throw new Error('Please type a message before sending.')
  }
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`)
  }

  const data = await api.post('/chat', {
    message: message.trim(),
    conversationHistory,
  })

  if (!data || typeof data.response !== 'string') {
    throw new Error('Sorry, I could not get a response. Please try again later.')
  }

  return { response: data.response }
}
