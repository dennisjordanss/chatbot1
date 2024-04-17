import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function openaiTest(question) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
    });
    return chatCompletion;  // Returns the full completion object
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;  // Optional: re-throw to handle the error elsewhere
  }
}
