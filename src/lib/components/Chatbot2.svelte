<script>
    import { openaiTest } from '$lib/services/openaiService.js';
    let inputQuestion = '';
    let messages = [];
    let isLoading = false;
  
    async function handleQuestion() {
      if (!inputQuestion.trim()) return;
      isLoading = true;
      messages = [...messages, { role: 'user', content: inputQuestion }];  // Ensure reactivity by creating a new array
  
      try {
        const response = await openaiTest(inputQuestion);
        messages = [...messages, { role: 'bot', content: response }];  // Ensure reactivity by creating a new array
        console.log("response:", response);
      } catch (error) {
        messages = [...messages, { role: 'bot', content: 'Failed to fetch response.' }];  // Ensure reactivity by creating a new array
        console.error('OpenAI API error:', error);
      }
  
      inputQuestion = '';  // Clear input after sending
      isLoading = false;
    }
  </script>
  
  <div class="chat-container">
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
      on:keydown={(e) => { if (e.key === 'Enter' && !isLoading) handleQuestion(); }}
      placeholder="Ask me anything..."
      disabled={isLoading}
    >
    <button on:click={handleQuestion} disabled={!inputQuestion.trim() || isLoading}>Send</button>
  </div>
  
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
    .chat-input {
      width: 100%;
      padding: 10px;
      margin-bottom: 8px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #ccc;
    }
  </style>
  