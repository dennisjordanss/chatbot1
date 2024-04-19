// src/lib/services/openaiService.js
import OpenAI from "openai";
import { env } from "$env/dynamic/private";
import fs from "fs";

const openai = new OpenAI({
  apiKey: env.VITE_OPENAI_API_KEY,
});

let assistantId;
let threadId;

async function createAssistant() {
  console.log("Creating new assistant...");
  const assistant = await openai.beta.assistants.create({
    name: "Dennis AI",
    instructions:
      "You are Dennis AI, a helpful and knowledgeable assistant. You are smart and friendly.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-turbo-preview",
  });
  console.log("Assistant created with ID:", assistant.id);
  return assistant.id;
}

async function createThread() {
  console.log("Creating new thread...");
  const thread = await openai.beta.threads.create();
  console.log("Thread created with ID:", thread.id);
  return thread.id;
}

async function addMessageToThread(threadId, content) {
  console.log(`Adding message to thread: ${threadId}`);
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });
}

async function runAssistant(threadId, assistantId) {
  console.log(`Creating run with assistant: ${assistantId}`);
  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  console.log(`Run created with status: ${run.status}`);

  // Polling the run status until it completes
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
    console.log(`Updated run status: ${run.status}`);
  }

  return run;
}

async function retrieveMessages(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log("🚀 ~ retrieveMessages ~ messages:", messages);
  console.log(
    `Messages retrieved from thread: ${messages.data.length} messages`
  );
  return messages.data;
}

export async function askGptQuestion(question) {
  console.log("Received question:", question);
  if (!assistantId) assistantId = await createAssistant();
  if (!threadId) threadId = await createThread();

  await addMessageToThread(threadId, question);
  const run = await runAssistant(threadId, assistantId);

  if (run.status === "completed") {
    const messages = await retrieveMessages(threadId);
    console.log("🚀 ~ xxx ~ messages:", messages);
    const response_text = messages[0].content[0].text.value;
    console.log("🚀 ~ askGptQuestion ~ response_text:", response_text);
    return response_text;
    // return messages.find(msg => msg.role === 'assistant')?.content || "No assistant response.";
  } else {
    console.log("Run did not complete, status:", run.status);
    return { error: "Run did not complete.", status: run.status };
  }
}

export async function uploadFile(file) {
  try {
    // Get the readable stream from the File object
    // const fileStream = file.stream();

    // Create the file in OpenAI's system using the stream
    const uploadedFile = await openai.files.create({
      file: file, // This stream is directly passed to OpenAI
      purpose: "assistants",
    });

    console.log("File uploaded with ID:", uploadedFile.id);
    return uploadedFile.id;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error; // Rethrow the error to handle it in the calling context
  }
}
