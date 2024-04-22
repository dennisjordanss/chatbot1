<!-- src/lib/components.Chatbot3 -->
<script>
  import { writable } from "svelte/store";

  export let form;

  const currentForm = writable(form);
  $: {
    console.log("🚀 ~ form has changed to: ", $currentForm);
  }

  let isLoading = false;
  let error = "";
</script>

<form method="post" action="?/askGptQuestion" class="chat-container min-h-700">
  <p>response is: {form?.response || ""}</p>

  <input
    type="text"
    name="text"
    class="chat-input input input-bordered"
    placeholder="Ask me anything..."
    disabled={isLoading}
  />
  <button type="submit" class="btn btn-primary">
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </button>
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
