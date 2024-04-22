<script>
  import { onMount } from "svelte";
  let uploading = false;
  let responseMessage = "";

  async function handleFileUpload(event) {
    event.preventDefault();
    const formData = new FormData(event.target); // event.target is the form itself
    uploading = true; // Set uploading to true when upload starts

    try {
      const response = await fetch("?/uploadFileToAssistant", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      responseMessage = `File uploaded successfully! File ID: ${result.fileId}`;
    } catch (error) {
      responseMessage = `Error uploading file: ${error.message}`;
      console.error("Error uploading file:", error);
    } finally {
      uploading = false; // Set uploading back to false when upload is done
    }
  }

  onMount(() => {
    console.log("FileUpload component mounted.");
  });
</script>

<form
  on:submit={handleFileUpload}
  action="/api/upload"
  method="post"
  enctype="multipart/form-data"
>
  <div class="form-control">
    <label class="flex items-center justify-between label">
      <span>
        <button type="submit" class="mt-4 btn btn-info" disabled={uploading}>
          {#if uploading}
            Uploading...
          {:else}
            Upload File
          {/if}
        </button>
      </span>
      <input
        type="file"
        name="file"
        disabled={uploading}
        id="file-input"
        class="w-full max-w-xs file-input file-input-bordered file-input-xs file-input-ghost"
      />
    </label>
  </div>

  {#if responseMessage}
    <p class="mt-4 text-success">{responseMessage}</p>
  {/if}
</form>

<style>
  .form-control {
    margin-bottom: 1rem;
  }

  .label {
    margin-bottom: 0.5rem;
  }

  .label-text {
    font-weight: bold;
  }

  .text-success {
    color: green;
  }
</style>
