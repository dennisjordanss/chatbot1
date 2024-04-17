<script>
    let messages = [];
    let newMessage = "";
    let messageId = 0;  // Unique identifier for each message

    const responses = {
        "hello": "Hi there! How can I help you today?",
        "how are you": "I'm doing well, thanks for asking! How about yourself?",
        "bye": "Goodbye! Have a great day!",
        "help": "Sure, I can help you. What do you need assistance with?",
        "thank you": "You're welcome! Anything else I can help with?"
    };

    function handleSend() {
        if (newMessage.trim()) {
            messages = [...messages, { id: messageId++, text: newMessage, sender: 'user' }];
            setTimeout(() => respondToMessage(newMessage.toLowerCase()), 500);
            newMessage = "";
        }
    }

    function respondToMessage(userMessage) {
        let botMessage = "Sorry, I didn't understand that.";
        Object.keys(responses).forEach(key => {
            if (userMessage.includes(key)) {
                botMessage = responses[key];
            }
        });
        messages = [...messages, { id: messageId++, text: botMessage, sender: 'bot' }];
    }

    function handleKeyUp(event) {
        if (event.key === 'Enter') {
            handleSend();
        }
    }
</script>

<div class="min-h-full bg-gray-100 p-4 flex flex-col" style="padding-top: var(--header-height);">
    <div class="flex-1 overflow-auto p-2 m-2 bg-white shadow rounded-lg">
        {#each messages as message (message.id)}  <!-- Using unique id for key -->
            <div class="flex">
                <div class={message.sender === 'user' ? "bg-blue-500 text-white p-2 rounded-lg max-w-xs ml-auto" : "bg-gray-300 text-black p-2 rounded-lg max-w-xs mr-auto"}>
                    {message.text}
                </div>
            </div>
        {/each}
    </div>
    <div class="mt-auto">
        <input type="text" placeholder="Say something..." bind:value={newMessage} on:keyup={handleKeyUp}
               class="form-input px-4 py-2 w-full rounded-b-none" />
        <button on:click={handleSend} class="btn w-full rounded-t-none">
            Send
        </button>
    </div>
</div>

<style>
    :global(:root) {
        --header-height: 160px;  /* Adjust this value based on your header's actual height */
    }

    .form-input {
        border: 2px solid transparent;
        transition: border 0.3s ease;
    }
    .form-input:focus {
        border-color: blue;
    }
</style>
