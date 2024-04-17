import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

export async function openaiStreamTest(question) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',  // Assuming GPT-4 is available and you want the latest model
    messages: [{ role: 'user', content: question }],
    stream: true,
  });

  try {
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
  } catch (error) {
    console.error('Error with streaming chat completion:', error);
    throw error;
  }
}
