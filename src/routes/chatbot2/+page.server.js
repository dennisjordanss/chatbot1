// src/routes/chatbot2/+page.server.js

import { askGptQuestion, uploadFile } from "$lib/services/openaiService.js";
import { error } from "@sveltejs/kit";

async function processFileUpload(file) {
  // Dummy function for uploading file logic
  console.log(`Processing file upload for: ${file.name}`);
  // Implement file processing logic here, e.g., saving to disk or cloud storage
  return "mock-file-id"; // Return a mock file ID or real one from your storage solution
}

/** @type {import('./$types').Actions} */
export const actions = {
  async askGptQuestion({ request }) {
    const formData = await request.formData();
    const text = formData.get("text"); // 'text' is the key of the text data in the form

    if (!text) {
      console.error("No text provided for GPT question.");
      throw error(400, "Text is required");
    }

    try {
      const summary = await askGptQuestion(text);
      console.log("🚀 Received summary from GPT:", summary);
      return { success: true, summary };
    } catch (err) {
      console.error("Error in askGptQuestion:", err);
      throw error(500, `Error processing question: ${err.message}`);
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
};
