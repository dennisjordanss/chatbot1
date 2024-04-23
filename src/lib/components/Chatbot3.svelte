<!-- src/lib/components/Chatbot3.svelte -->
<script>
  import { enhance } from "$app/forms";
  import ChatWindow from "./ChatWindow.svelte";

  export let form;

  let isLoading = false;
  let isFileUploaded = false;
  let currentQuestion;
  let messages = [];
  let assistantId;
  let threadId;
  let selectedFile = null;

  $: if (form?.response) {
    messages = [...messages, { role: "bot", content: form.response }];
    assistantId = form.assistantId;
    threadId = form.threadId;
  }

  function handleQuestionSubmit() {
    if (form?.response) {
      form.response = "";
    }
    messages = [...messages, { role: "user", content: currentQuestion }];
    currentQuestion = ""; // Clear the input field
  }

  function handleFileUpload() {
    if (form?.response) {
      form.response = "";
    }
    if (selectedFile) {
      messages = [
        ...messages,
        { role: "user", content: `Upload file: ${selectedFile.name}` },
      ];
      isFileUploaded = true;
      selectedFile = null; // Reset the selected file
    }
  }
</script>

<div class="chat-container min-h-700">
  <ChatWindow {messages} {isFileUploaded} />

  <form
    method="post"
    action="?/askGptQuestion"
    use:enhance
    on:submit|preventDefault={handleQuestionSubmit}
  >
    <input
      type="text"
      name="text"
      bind:value={currentQuestion}
      class="chat-input input input-bordered"
      placeholder="Ask me anything..."
      disabled={isLoading}
    />
    <button type="submit" class="btn btn-primary" disabled={isLoading}>
      Send Question
    </button>
  </form>

  <form
    method="post"
    action="?/uploadFileToAssistant"
    use:enhance
    enctype="multipart/form-data"
    on:submit|preventDefault={handleFileUpload}
  >
    <input
      type="file"
      name="file"
      class="w-full max-w-xs file-input file-input-bordered file-input-xs file-input-ghost"
      on:change={(e) => (selectedFile = e.target.files[0])}
    />
    <button type="submit" class="mt-4 btn btn-info" disabled={!selectedFile}>
      Upload File
    </button>
  </form>
</div>

<!-- Rest of the code remains the same -->

<style>
  .chat-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .chat-input {
    width: 100%;
    margin-bottom: 8px;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }

  .error {
    color: red;
  }
</style>
