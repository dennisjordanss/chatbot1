<!-- src/lib/components.Chatbot2 -->
<script>
  import FileUpload from "$lib/components/FileUploadButton.svelte";
  import DeleteFilesButton from "$lib/components/DeleteFilesButton.svelte";
  import DeleteAssistantsButton from "$lib/components/DeleteAssistantsButton.svelte";
  import NewThreadButton from "$lib/components/NewThreadButton.svelte";
  import ChatWindow from "$lib/components/ChatWindow.svelte";

  let inputQuestion = "";
  let messages = [];
  let isLoading = false;
  let error = "";

  function handleDeleteFiles() {
    // Handle the deleteFiles event
    console.log("All files deleted");
  }
  function handleDeleteAssistants() {
    // Handle the deleteAssistants event
    console.log("All assistants deleted");
  }
  function handleNewThread() {
    // Handle the newThread event
    console.log("New thread created");
    messages = []; // Clear the messages array when starting a new thread
  }

  async function handleQuestion(event) {
    event.preventDefault();
    if (!inputQuestion.trim()) return;
    isLoading = true;

    const formData = new FormData();
    formData.append("text", inputQuestion);

    try {
      const response = await fetch("?/askGptQuestion", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the response from the server");
      }

      const result = await response.json();
      let responseData = result.data; // Decode HTML entities in the response
      let formattedResponse = responseData.replace(/\\n/g, "<br>"); // Replace newline characters with HTML line breaks

      messages = [...messages, { role: "user", content: inputQuestion }];
      messages = [
        ...messages,
        {
          role: "bot",
          content: formattedResponse.slice(1, -1) || "No response from GPT",
        },
      ];
      inputQuestion = ""; // Clear input after sending

      // // Set the cookie
      // const cookieHeader = response.headers.get("Set-Cookie");
      // if (cookieHeader) {
      //   document.cookie = cookieHeader;
      // }
    } catch (err) {
      error = `Failed to send question: ${err.message}`;
      console.error("Error submitting question:", err);
    } finally {
      isLoading = false;
    }
  }
</script>

<form on:submit={handleQuestion} class="chat-container min-h-700">
  <ChatWindow {messages} />

  <input
    class="chat-input input input-bordered"
    bind:value={inputQuestion}
    on:keydown={(e) => e.key === "Enter" && handleQuestion(e)}
    placeholder="Ask me anything..."
    disabled={isLoading}
  />
  <button
    type="submit"
    class="btn btn-primary"
    disabled={!inputQuestion.trim() || isLoading}>Send</button
  >

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="button-group">
    <DeleteFilesButton on:deleteFiles={handleDeleteFiles} />
    <DeleteAssistantsButton on:deleteAssistants={handleDeleteAssistants} />
    <NewThreadButton on:newThread={handleNewThread} />
  </div>
  <FileUpload />
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
