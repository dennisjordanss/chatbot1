<!-- /src/routes/chatbot1/+page.svelte -->
<script>
    import Chatbot2 from '$lib/components/Chatbot2.svelte'; 
</script>

<div class="container mx-auto px-4 h-full">
    <div class="chat-container">
        <div class="chat-header">
            Denbot 9000
        </div>
        <div class="chat-body">
            <Chatbot2 />
        </div>
    </div>
</div>

<style>
    /* Assuming a 60px header; adjust as needed */
    :root {
        --header-height: 60px;
    }

    .chat-container {
        height: calc(100vh - var(--header-height)); /* Full viewport height minus header */
        display: flex;
        flex-direction: column;
    }

    .chat-header {
        background-color: #333; /* Adjust color as needed */
        color: white;
        padding: 15px;
        font-size: 1.5rem; /* Adjust size as needed */
    }

    .chat-body {
        flex: 1; /* Take up remaining space */
        overflow-y: auto; /* Scroll if content overflows */
    }
</style>


