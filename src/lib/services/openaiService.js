// src/lib/services/openaiService.js
import OpenAI from "openai";
import { env } from "$env/dynamic/private";
import fs from "fs";

const openai = new OpenAI({
  apiKey: env.VITE_OPENAI_API_KEY,
});

let assistantId;
let threadId;
let vectorStoreId;

// Create a new assistant
async function createAssistant() {
  console.log("Creating new assistant...");
  const assistant = await openai.beta.assistants.create({
    name: "Dennis AI",
    instructions:
      "You are Dennis AI, a helpful and knowledgeable assistant. You are smart and friendly.",
    tools: [{ type: "file_search" }],
    model: "gpt-4-turbo-preview",
  });
  console.log("Assistant created with ID:", assistant.id);
  return assistant.id;
}

// Create a new thread
async function createThread() {
  console.log("Creating new thread...");
  const thread = await openai.beta.threads.create();
  console.log("Thread created with ID:", thread.id);
  return thread.id;
}

// Add a message to a thread
async function addMessageToThread(threadId, content) {
  console.log(`Adding message to thread: ${threadId}`);
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });
}

// Run an assistant on a thread
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

// Fetch all vector stores and find one by name
async function findVectorStoreByName(storeName) {
  console.log("Fetching existing vector stores...");

  if (!openai.beta.vectorStores) {
    console.warn("Vector stores feature is not available.");
    return null;
  }

  const vectorStores = await openai.beta.vectorStores.list({
    limit: 100, // Adjust limit based on your needs
  });

  const existingStore = vectorStores.data.find((v) => v.name === storeName);
  return existingStore ? existingStore.id : null;
}

// Create a new vector store
async function createVectorStore(name) {
  if (!openai.beta.vectorStores) {
    console.error(
      "Vector stores feature is not available. Unable to create a new vector store."
    );
    throw new Error("Vector stores feature is not available.");
  }

  const vectorStore = await openai.beta.vectorStores.create({
    name: name,
    file_ids: [], // Initially empty, files can be added later
  });
  console.log(`Created new vector store: ${vectorStore.id}`);
  return vectorStore.id;
}

// Ensure a vector store exists, either by finding an existing one or creating a new one
export async function ensureVectorStore(name) {
  if (!vectorStoreId) {
    const existingStoreId = await findVectorStoreByName(name);
    vectorStoreId = existingStoreId || (await createVectorStore(name));
  }
  return vectorStoreId;
}

// Retrieve messages from a thread
async function retrieveMessages(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log(
    `Messages retrieved from thread: ${messages.data.length} messages`
  );
  return messages.data;
}

// Ask a question to the GPT assistant
// Ask a question to the GPT assistant
export async function askGptQuestion(question) {
  console.log("Received question:", question);

  // Ensure vector store exists
  const vectorStoreId = await ensureVectorStore("my_vector_store");

  if (!assistantId) {
    assistantId = await createAssistant();
  } else {
    // Update the existing assistant with the vector store access
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId],
        },
      },
    });
    console.log("Assistant updated with vector store access");
  }

  if (!threadId) threadId = await createThread();

  await addMessageToThread(threadId, question);
  const run = await runAssistant(threadId, assistantId);

  if (run.status === "completed") {
    const messages = await retrieveMessages(threadId);
    const response_text = messages[0].content[0].text.value;
    console.log("GPT response:", response_text);
    return response_text;
  } else {
    console.log("Run did not complete, status:", run.status);
    return { error: "Run did not complete.", status: run.status };
  }
}

// Upload a file to OpenAI
export async function uploadFile(file) {
  try {
    // Create the file in OpenAI's system using the stream
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    console.log("File uploaded with ID:", uploadedFile.id);

    // Ensure vector store is ready
    const vectorStoreId = await ensureVectorStore("my_vector_store");

    if (vectorStoreId) {
      // Attach the uploaded file to the vector store
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: uploadedFile.id,
      });
      console.log("File added to vector store");
    } else {
      console.warn(
        "Vector store not available. File not added to vector store."
      );
    }

    return uploadedFile.id;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}
