<script>
  import { onMount } from "svelte";

  let uploading = false;
  let responseMessage = "";

  async function handleFileUpload(event) {
    event.preventDefault();
    const formData = new FormData(event.target); // event.target is the form itself

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
      uploading = false;
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
  <input type="file" name="file" disabled={uploading} id="file-input" />
  <button type="submit" disabled={uploading}> Upload File </button>
  {#if responseMessage}
    <p>{responseMessage}</p>
  {/if}
</form>

<style>
  input[type="file"] {
    margin-bottom: 10px;
  }
  button {
    padding: 8px 16px;
    font-size: 16px;
    cursor: pointer;
  }
  p {
    margin-top: 15px;
    color: green;
  }
</style>
