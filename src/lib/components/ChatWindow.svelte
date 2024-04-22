<!-- src/lib/components/ChatWindow.svelte -->
<script>
  export let messages = [];
</script>

<div class="chat-window">
  {#each messages as message}
    <div
      class="chat"
      class:chat-start={message.role === "user"}
      class:chat-end={message.role === "bot"}
    >
      <div
        class="chat-bubble"
        class:chat-bubble-primary={message.role === "user"}
        class:chat-bubble-secondary={message.role === "bot"}
      >
        {@html message.content}
      </div>
    </div>
  {/each}
</div>

<style>
  .chat-window {
    height: 500px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 8px;
  }
</style>
