<!-- src/lib/components/Chatbot3.svelte -->
<script>
  import { writable } from "svelte/store";
  import { enhance } from "$app/forms";
  import ChatWindow from "./ChatWindow.svelte";

  export let form;
  //   const currentForm = writable(form);
  //   $: {
  //     console.log("🚀 ~ form has changed to: ", $currentForm);
  //   }

  let isLoading = false;
  let error = "";
  let currentQuestion;
  //   let currentResponse;
  let messages = [];

  $: if (form?.response) {
    // currentResponse = form.response;
    messages = [...messages, { role: "bot", content: form.response }];
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
  <button type="submit" class="btn btn-primary" disabled={isLoading}>
    {#if isLoading}
      Loading...
    {:else}
      Send
    {/if}
  </button>
  {#if error}
    <p class="error">{error}</p>
  {/if}
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
