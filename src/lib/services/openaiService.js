// src/lib/services/openaiService.js
import OpenAI from "openai";
import { env } from "$env/dynamic/private";

const openai = new OpenAI({
  apiKey: env.VITE_OPENAI_API_KEY,
});

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

  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
    console.log(`Updated run status: ${run.status}`);
  }

  return run;
}

async function ensureVectorStore(name) {
  const vectorStoreId = await findOrCreateVectorStore(name);
  return vectorStoreId;
}

async function findOrCreateVectorStore(storeName) {
  try {
    const response = await openai.beta.vectorStores.list({ limit: 100 });
    const store = response.data.find((v) => v.name === storeName);
    if (store) {
      console.log(`Using existing vector store: ${store.id}`);
      return store.id;
    } else {
      return await createVectorStore(storeName);
    }
  } catch (error) {
    console.error("Failed to manage vector store:", error);
    throw error;
  }
}

async function createVectorStore(name) {
  try {
    const vectorStore = await openai.beta.vectorStores.create({
      name: name,
      file_ids: [],
    });
    console.log(`Created new vector store: ${vectorStore.id}`);
    return vectorStore.id;
  } catch (error) {
    console.error("Failed to create vector store:", error);
    throw error;
  }
}

async function retrieveMessages(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log(
    `Messages retrieved from thread: ${messages.data.length} messages`
  );
  return messages.data;
}

async function assistantExists(assistantId) {
  try {
    const response = await openai.beta.assistants.list();
    const assistants = response.data; // this will be an array of assistant objects
    return assistants.some((assistant) => assistant.id === assistantId);
  } catch (error) {
    console.error("Failed to fetch assistants:", error);
    throw error;
  }
}

async function checkAndCreateAssistant(assistantId) {
  const exists = await assistantExists(assistantId);
  if (!exists) {
    console.log("Assistant ID not found or invalid, creating new assistant.");
    return await createAssistant();
  } else {
    console.log("Valid assistant ID, no need to create a new one.");
    return assistantId; // return the existing ID
  }
}

async function checkAndCreateThread(threadId) {
  if (!threadId || threadId === "undefined") {
    console.log("threadid not found or is 'undefined'");
    return createThread();
  } else {
    try {
      await openai.beta.threads.retrieve(threadId);
      console.log("Existing thread will be used:", threadId);
      return threadId;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Thread not found. Creating a new thread.");
        return createThread();
      } else {
        throw error;
      }
    }
  }
}

export async function deleteAllFiles() {
  try {
    const response = await openai.files.list();
    const files = response.data;

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

export async function deleteAllAssistants() {
  try {
    const response = await openai.beta.assistants.list();
    const assistants = response.data;

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

export async function uploadFile(file, assistantId) {
  try {
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    console.log("File uploaded with ID:", uploadedFile.id);

    const vectorStoreId = await ensureVectorStore("my_vector_store");

    if (vectorStoreId) {
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: uploadedFile.id,
      });
      console.log("File added to vector store");
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

export async function createThread() {
  console.log("Creating new thread...");
  const thread = await openai.beta.threads.create();
  console.log("Thread created with ID:", thread.id);
  return thread.id;
}

export async function askGptQuestion(question, assistantid, threadid) {
  console.log("Received question:", question);
  console.log("assistantid:", assistantid);
  console.log("threadid:", threadid);

  await ensureVectorStore("my_vector_store");

  const assistantId = await checkAndCreateAssistant(assistantid);
  const threadId = await checkAndCreateThread(threadid);

  await addMessageToThread(threadId, question);
  console.log("Message added to thread");

  const run = await runAssistant(threadId, assistantId);
  console.log("Run completed with status:", run.status);

  if (run.status === "completed") {
    const messages = await retrieveMessages(threadId);
    const response_text = messages[0].content[0].text.value;
    console.log("GPT response:", response_text);

    return {
      response: response_text,
      updatedAssistantId: assistantId,
      updatedThreadId: threadId,
    };
  } else {
    console.log("Run did not complete, status:", run.status);
    return { error: "Run did not complete.", status: run.status };
  }
}
