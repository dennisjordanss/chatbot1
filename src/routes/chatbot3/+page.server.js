// src/routes/chatbot2/+page.server.js

import {
  askGptQuestion,
  uploadFile,
  deleteAllFiles,
  deleteAllAssistants,
  createThread,
} from "$lib/services/openaiService.js";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').Actions} */
export const actions = {
  async askGptQuestion({ request, cookies }) {
    const formData = await request.formData();
    const text = formData.get("text");
    if (!text) {
      console.error("No text provided for GPT question.");
      throw error(400, "Text is required");
    }
    try {
      const { response, assistantId, threadId } = await askGptQuestion(
        text,
        cookies.get("assistantId"),
        cookies.get("threadId"),
        cookies
      );
      console.log("Received response from GPT:", response);
      console.log("Assistant ID:", assistantId);
      console.log("Thread ID:", threadId);

      // Set the assistantId cookie
      cookies.set("assistantId", assistantId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 52, // 1 year
        httpOnly: true,
        sameSite: "strict",
      });

      return {
        response: response,
        assistantId: assistantId,
        threadId: threadId,
      };
    } catch (err) {
      console.error("Error in askGptQuestion:", err);
      throw error(500, `Error processing question: ${err.message}`);
    }
  },
  async createNewThread({ request, cookies }) {
    await request.formData(); // Parse the form data
    try {
      const threadId = await createThread();
      console.log("New thread created with ID:", threadId);

      // Set the threadId cookie
      cookies.set("threadId", threadId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 52, // 1 year
        httpOnly: true,
        sameSite: "strict",
      });

      return {
        status: 200,
        body: JSON.stringify({ threadId }),
      };
    } catch (err) {
      console.error("Error creating new thread:", err);
      throw error(500, `Error creating new thread: ${err.message}`);
    }
  },
  async uploadFileToAssistant({ request }) {
    console.log("Processing file upload request...");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      console.error("Upload error: No file provided in the request.");
      throw error(400, "No file uploaded");
    }

    console.log(
      `Received file for upload: ${file.name}, size: ${file.size} bytes`
    );

    try {
      const fileId = await uploadFile(file); // Ensure uploadFile can handle the file object correctly
      const confirmation_text = `File uploaded successfully, ID: ${fileId}`;
      console.log(confirmation_text);

      return confirmation_text;
    } catch (err) {
      console.error("Failed to upload file:", err);
      throw error(500, `Failed to upload file: ${err.message}`);
    }
  },
  async deleteFiles({ request }) {
    await request.formData(); // Parse the form data
    try {
      await deleteAllFiles();
      return {
        status: 200,
        body: JSON.stringify({ message: "All files deleted successfully." }),
      };
    } catch (err) {
      console.error("Error deleting files:", err);
      throw error(500, `Error deleting files: ${err.message}`);
    }
  },
  async deleteAssistants({ request }) {
    await request.formData(); // Parse the form data

    try {
      await deleteAllAssistants();
      return {
        status: 200,
        body: JSON.stringify({
          message: "All assistants deleted successfully.",
        }),
      };
    } catch (err) {
      console.error("Error deleting assistants:", err);
      throw error(500, `Error deleting assistants: ${err.message}`);
    }
  },
};
