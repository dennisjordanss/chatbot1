<script>
  import FileUpload from "$lib/components/FileUploadButton.svelte";
  import DeleteFilesButton from "$lib/components/DeleteFilesButton.svelte";
  import DeleteAssistantsButton from "$lib/components/DeleteAssistantsButton.svelte";

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

<form on:submit={handleQuestion} class="chat-container">
  <div class="messages">
    {#each messages as message}
      <div class={`message ${message.role}`}>
        {message.content}
      </div>
    {/each}
  </div>
  <input
    class="chat-input"
    bind:value={inputQuestion}
    on:keydown={(e) => e.key === "Enter" && handleQuestion(e)}
    placeholder="Ask me anything..."
    disabled={isLoading}
  />
  <button type="submit" disabled={!inputQuestion.trim() || isLoading}
    >Send</button
  >
  <FileUpload />
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <DeleteFilesButton on:deleteFiles={handleDeleteFiles} />
  <DeleteAssistantsButton on:deleteAssistants={handleDeleteAssistants} />
</form>

<style>
  .chat-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .messages {
    margin-bottom: 16px;
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 8px;
  }
  .message {
    padding: 8px;
    margin: 4px;
    border-radius: 4px;
  }
  .message.user {
    background-color: #daf1da;
    text-align: left;
  }
  .message.bot {
    background-color: #e1e5ea;
    text-align: left;
  }
  .chat-input,
  button {
    width: 100%;
    padding: 10px;
    margin-bottom: 8px;
    box-sizing: border-box;
  }
  button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:disabled {
    background-color: #ccc;
  }
  .error {
    color: red;
  }
</style>
