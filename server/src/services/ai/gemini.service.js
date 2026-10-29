import { GoogleGenAI } from "@google/genai";
import { config } from "../../config/env.js";

// Validate Gemini configuration at import time — never leak the key
const geminiApiKey = config.ai.gemini.apiKey;
const geminiModel = config.ai.gemini.model;
const geminiBaseUrl = config.ai.gemini.baseUrl;

/**
 * Gemini AI service.
 * - Reads the API key from server-side env var GEMINI_API_KEY only.
 * - Uses the Google Gen AI SDK (v2) with the Gemini API.
 * - All functions validate inputs and throw descriptive errors without revealing the key.
 * - Calls are wrapped with timeouts and safe fallbacks.
 * - When GEMINI_API_KEY is not configured, returns a mock response for testing.
 */

const client = geminiApiKey
  ? new GoogleGenAI({ apiKey: geminiApiKey, baseUrl: geminiBaseUrl })
  : null;

/**
 * Send a message to Gemini and return the response text.
 * Validates inputs, applies a timeout, and falls back to mock if key not configured.
 */
export async function geminate({ message, conversationHistory = [], timeoutMs = 15000 }) {
  // 1. Guard: message must be a non-empty string
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Please type a message before sending.');
  }

  // 2. Guard: conversationHistory must be an array
  if (!Array.isArray(conversationHistory)) {
    throw new Error('Invalid conversation history.');
  }

  // 3. If no API key configured, return a mock response for testing
  if (!client) {
    return {
      response: 'I understand you are asking about INDIA ALL products and services. As an AI assistant, I can help you explore our commodity catalogue, provide product details, or assist with bulk enquiries. For specific product information, please ask about a commodity or product name, or type "quotation" to start a quote request.',
    };
  }

  // 4. Build content parts for Gemini
  const parts = [message.trim()];

  // Conversation history (last 6 exchanges, condensed)
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory
      .slice(-6)
      .map((m) => {
        if (typeof m === 'string') return m;
        if (m && typeof m === 'object' && m.role && m.content) {
          return `User: ${m.content}\nAssistant: ${m.content}`;
        }
        return String(m);
      });
    parts.unshift(...recent);
  }

  // 5. Make the request with a timeout
  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), timeoutMs);

  try {
    const result = await client.models.generateContent({
      model: geminiModel,
      contents: parts,
    }, { signal: abortCtrl.signal });

    // 6. Extract the response text
    const text = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('AI returned an empty or unexpected response.');
    }

    return { response: text.trim() };
  } catch (err) {
    // 7. Normalize errors — never surface the API key or raw Gemini error details
    if (err.name === 'AbortError') {
      throw new Error('The AI request timed out. Please try again.');
    }
    if (err.message && err.message.includes('API key not valid')) {
      throw new Error('AI service authentication failed. Please contact support.');
    }
    // Re-throw for the caller to handle (fallback to static response)
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Narrowly scoped backend function: prepare an enquiry with collected details.
 * Validates that required fields are present before returning the payload.
 * Does NOT persist to database — the route handler persists the enquiry.
 */
export function prepareEnquiry({ name, company, email, product, specifications, quantity, origin, destination, consent }) {
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Full name is required';
  if (!company || !company.trim()) errors.company = 'Company name is required';
  if (!email || !email.trim()) errors.email = 'Business email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid business email address';
  if (!product || !product.trim()) errors.product = 'Product or commodity is required';
  if (consent === undefined || consent === null) errors.consent = 'You must consent to processing';

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    enquiry: {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      product: product.trim(),
      specifications: specifications ? specifications.trim() : '',
      quantity: quantity ? quantity.trim() : '',
      deliveryLocation: origin || '',
      country: destination || '',
      enquiryType: 'general',
      message: '',
      consent: consent === true,
    },
  };
}

/**
 * Narrowly scoped backend function: submit an enquiry.
 * Returns the payload structure for the route handler to persist via the existing API.
 */
export function submitEnquiry(enquiry) {
  // Returns success status; the route handler calls the existing API to persist
  return { success: true, enquiry: enquiry };
}

/**
 * Narrowly scoped backend function: request email verification code for enquiry status.
 */
export function requestEnquiryVerification({ enquiryReference, email }) {
  if (!enquiryReference || !email) {
    return { valid: false, error: 'Missing enquiry reference or email.' };
  }

  // In a production system, we would generate a secure random code,
  // store it server-side (e.g., in Redis or the database with a short TTL),
  // and return a verification reference to the frontend.
  // For this integration, we delegate to the existing backend service
  // through the route handler.
  return { valid: false, error: 'Verification code request delegated to backend endpoint.' };
}

/**
 * Narrowly scoped backend function: verify an enquiry code.
 */
export function verifyEnquiryCode({ verificationId, code }) {
  if (!verificationId || !code) {
    return { valid: false, error: 'Missing verification data.' };
  }

  // Delegated to the existing backend endpoint
  return { valid: false, error: 'Code verification delegated to backend endpoint.' };
}

/**
 * Narrowly scoped backend function: request human handoff.
 * Collects minimum contact info and prepares a summary for the existing email workflow.
 */
export function requestHumanHandoff({ name, email, reason }) {
  if (!name || !email || !reason) {
    return { valid: false, error: 'Missing required information for handoff.' };
  }

  // Delegated to the existing backend endpoint
  return { valid: false, error: 'Handoff delegated to backend endpoint.' };
}

export default {
  geminate,
  prepareEnquiry,
  submitEnquiry,
  requestEnquiryVerification,
  verifyEnquiryCode,
  requestHumanHandoff,
};