<!-- src/lib/components/Chatbot3.svelte -->
<script>
  import { writable } from "svelte/store";
  import { enhance } from "$app/forms";
  import ChatWindow from "./ChatWindow.svelte";

  export let form;

  let isLoading = false;
  let uploading = false;
  let currentQuestion;
  let messages = [];
  let assistantId;
  let threadId;

  $: if (form?.response) {
    // currentResponse = form.response;
    messages = [...messages, { role: "bot", content: form.response }];
    assistantId = form.assistantId;
    threadId = form.threadId;
  }

  function handleSubmit() {
    if (form?.response) {
      form.response = "";
    }
    messages = [...messages, { role: "user", content: currentQuestion }];
  }
</script>

<form
  method="post"
  action="?/askGptQuestion"
  use:enhance
  enctype="multipart/form-data"
  class="chat-container min-h-700"
  on:submit={handleSubmit}
>
  <ChatWindow {messages} />
  <input
    type="text"
    name="text"
    bind:value={currentQuestion}
    class="chat-input input input-bordered"
    placeholder="Ask me anything..."
    disabled={isLoading}
  />
  <button type="submit" class="btn btn-primary" disabled={isLoading}
    >Submit</button
  >
  <label class="flex items-center justify-between label">
    <button formaction="?/uploadFileToAssistant" class="mt-4 btn btn-info">
      Upload File
    </button>
    <input
      type="file"
      name="file"
      id="file-input"
      class="w-full max-w-xs file-input file-input-bordered file-input-xs file-input-ghost"
    />
  </label>
</form>

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
