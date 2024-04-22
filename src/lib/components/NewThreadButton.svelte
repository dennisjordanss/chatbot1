<!-- src/lib/components/NewThreadButton.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  let isCreatingThread = false;
  let error = "";

  const dispatch = createEventDispatcher();

  async function handleNewThread() {
    isCreatingThread = true;
    error = "";

    try {
      const formData = new FormData();
      // Add a dummy field to the form data
      formData.append("_dummy", "dummy");
      const response = await fetch("?/createNewThread", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create new thread");
      }

      dispatch("newThread");
    } catch (err) {
      error = err.message;
    } finally {
      isCreatingThread = false;
    }
  }
</script>

<button
  class="btn btn-accent"
  on:click={handleNewThread}
  disabled={isCreatingThread}
>
  {#if isCreatingThread}
    Creating new thread...
  {:else}
    New Thread
  {/if}
</button>

{#if error}
  <p class="error">{error}</p>
{/if}

<style>
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .error {
    color: red;
  }
</style>
