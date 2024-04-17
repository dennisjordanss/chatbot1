import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,  // Note: This is generally not recommended for production
});

let assistantId;
let threadId;

async function initializeAssistant() {
  if (!assistantId) {
    console.log("Initializing new assistant...");
    const assistant = await openai.beta.assistants.create({
      name: "Dennis AI",
      instructions: "You are Dennis AI, a helpful and knowledgeable assistant. You are smart and friendly.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-turbo-preview"
    });
    assistantId = assistant.id;
    console.log("Assistant created with ID:", assistantId);
  } else {
    console.log("Using existing assistant with ID:", assistantId);
  }
}

async function getOrCreateThread() {
  if (!threadId) {
    console.log("Creating new thread...");
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    console.log("Thread created with ID:", threadId);
  } else {
    console.log("Using existing thread with ID:", threadId);
  }
}

export async function askGptQuestion(question) {
  console.log("Received question:", question);
  await initializeAssistant();
  await getOrCreateThread();

  try {
    console.log("Adding message to thread:", threadId);
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: question,
    });

    console.log("Creating run with assistant:", assistantId);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    console.log("Run created with status:", run.status);
    // Wait for the run to complete
    while (run.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));  // Wait for 1 second before checking again
      const updatedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
      run.status = updatedRun.status;
      console.log("Updated run status:", run.status);
      if (run.status === 'completed') {
        break;
      }
    }

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      console.log("Messages retrieved from thread:", messages.data.length, "messages");
      const response_text = messages.data[0].content[0].text.value
      console.log(response_text);
      return response_text
    } else {
      console.log("Run did not complete, status:", run.status);
      return { error: 'Run did not complete.', status: run.status };
    }
  } catch (error) {
    console.error('Error with OpenAI Assistant operations:', error);
    throw new Error('Failed to generate response from OpenAI.');
  }
}
