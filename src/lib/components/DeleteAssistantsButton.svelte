<!-- src/lib/components/DeleteAssistantsButton.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  let isDeleting = false;
  let error = "";

  const dispatch = createEventDispatcher();

  async function handleDeleteAssistants() {
    isDeleting = true;
    error = "";

    try {
      const formData = new FormData();
      formData.append("_dummy", "dummy");

      const response = await fetch("?/deleteAssistants", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to delete assistants");
      }

      dispatch("deleteAssistants");
    } catch (err) {
      error = err.message;
    } finally {
      isDeleting = false;
    }
  }
</script>

<button
  class="btn btn-secondary"
  on:click={handleDeleteAssistants}
  disabled={isDeleting}
>
  {#if isDeleting}
    Deleting assistants...
  {:else}
    Delete All Assistants
  {/if}
</button>

{#if error}
  <p class="error">{error}</p>
{/if}
