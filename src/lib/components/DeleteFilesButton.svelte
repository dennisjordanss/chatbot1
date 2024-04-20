<!-- src/lib/components/DeleteFilesButton.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  let isDeleting = false;
  let error = "";

  const dispatch = createEventDispatcher();

  async function handleDeleteFiles() {
    isDeleting = true;
    error = "";

    try {
      const formData = new FormData();
      // Add a dummy field to the form data
      formData.append("_dummy", "dummy");

      const response = await fetch("?/deleteFiles", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to delete files");
      }

      dispatch("deleteFiles");
    } catch (err) {
      error = err.message;
    } finally {
      isDeleting = false;
    }
  }
</script>

<button
  class="btn btn-primary"
  on:click={handleDeleteFiles}
  disabled={isDeleting}
>
  {#if isDeleting}
    Deleting files...
  {:else}
    Delete All Files
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
