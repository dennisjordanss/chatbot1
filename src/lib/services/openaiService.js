// src/lib/services/openaiService.js
import OpenAI from "openai";
import cookie from "cookie";
import { env } from "$env/dynamic/private";

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
    name: "Denbot 9000",
    instructions:
      "You are Denbot 9000, a helpful and knowledgeable assistant. You are smart and friendly.",
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
async function ensureVectorStore(name) {
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

// Delete all files from OpenAI
export async function deleteAllFiles() {
  try {
    // Retrieve the list of files
    const response = await openai.files.list();
    const files = response.data;

    // Delete each file
    for (const file of files) {
      await openai.files.del(file.id);
      console.log(`Deleted file: ${file.id}`);
    }

    console.log("All files deleted successfully.");
  } catch (error) {
    console.error("Failed to delete files:", error);
    throw error;
  }
}

// Delete all assistants
export async function deleteAllAssistants() {
  try {
    // Retrieve the list of assistants
    const response = await openai.beta.assistants.list();
    const assistants = response.data;

    // Delete each assistant
    for (const assistant of assistants) {
      await openai.beta.assistants.del(assistant.id);
      console.log(`Deleted assistant: ${assistant.id}`);
    }

    console.log("All assistants deleted successfully.");
  } catch (error) {
    console.error("Failed to delete assistants:", error);
    throw error;
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
      // Update the existing assistant with the vector store access
      await openai.beta.assistants.update(assistantId, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
      });
      console.log("Assistant updated with vector store access");
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

// Ask a question to the GPT assistant
export async function askGptQuestion(question, assistantid, threadid, cookies) {
  console.log("Received question:", question);
  console.log("assistantid:", assistantid);
  console.log("threadid:", threadid);

  // Ensure vector store exists
  const vectorStoreId = await ensureVectorStore("my_vector_store");

  let assistantId;
  let threadId;

  // Check if the assistantId exists in the cookie
  console.log("Checking if assistant exists");
  if (assistantid) {
    assistantId = assistantid;
    console.log("Assistant ID found in cookie:", assistantId);

    try {
      // Check if the assistant exists
      await openai.beta.assistants.retrieve(assistantId);
      console.log("Existing assistant will be used:", assistantId);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Assistant not found. Creating a new assistant.");
        assistantId = await createAssistant();
        console.log("New assistant created with ID:", assistantId);
      } else {
        throw error;
      }
    }
  } else {
    console.log("assistantId not found in cookie");
    // If assistantId is not set, create a new assistant
    assistantId = await createAssistant();
    console.log("New assistant created with ID:", assistantId);
  }

  // Check if the threadid exists in the cookie
  console.log("Checking if thread exists");
  if (threadid) {
    threadId = threadid;
    console.log("Thread ID found in cookie:", threadId);

    try {
      // Check if the thread exists
      await openai.beta.threads.retrieve(threadId);
      console.log("Existing thread will be used:", threadId);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Thread not found. Creating a new thread.");
        threadId = await createThread();
        console.log("New thread created with ID:", threadId);
      } else {
        throw error;
      }
    }
  } else {
    console.log("threadid not found in cookie");
    // If threadid is not set, create a new thread
    threadId = await createThread();
    console.log("New thread created with ID:", threadId);
  }

  await addMessageToThread(threadId, question);
  console.log("Message added to thread");

  const run = await runAssistant(threadId, assistantId);
  console.log("Run completed with status:", run.status);

  if (run.status === "completed") {
    const messages = await retrieveMessages(threadId);
    const response_text = messages[0].content[0].text.value;
    console.log("GPT response:", response_text);

    // Set the threadId cookie
    cookies.set("threadId", threadId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: "strict",
    });

    return {
      response: response_text,
      assistantId: assistantId,
      threadId: threadId,
    };
  } else {
    console.log("Run did not complete, status:", run.status);
    return { error: "Run did not complete.", status: run.status };
  }
}
