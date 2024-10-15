function setupChat(user) {
  const chatDiv = document.getElementById('chat');
  const messageInput = document.getElementById('message');
  const sendButton = document.getElementById('send');

  const currentUser = user; // Store the current user's name

  // Function to load and display chat messages
  function loadMessages() {
      const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
      chatDiv.innerHTML = messages.map(msg => {
          // Check if the message is sent by the current user
          const isSent = msg.startsWith(`${currentUser}:`);
          const messageClass = isSent ? 'sent' : 'received';
          return `<p class="message ${messageClass}">${msg}</p>`;
      }).join('');
      chatDiv.scrollTop = chatDiv.scrollHeight; // Auto-scroll to the bottom
  }

  // Function to send a message
  function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText) {
          const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
          messages.push(`${currentUser}: ${messageText}`); // Add the user and message
          localStorage.setItem('chatMessages', JSON.stringify(messages));
          messageInput.value = ''; // Clear the input
          loadMessages(); // Refresh the chat window
      }
  }

  // Event listener for the send button
  sendButton.addEventListener('click', sendMessage);

  // Event listener for the "Enter" key in the input field
  messageInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
          sendMessage();
      }
  });

  // Sync the chat windows in real-time using localStorage event listener
  window.addEventListener('storage', loadMessages);

  // Initial load of messages when the page loads
  loadMessages();
}

let mediaRecorder;
let recordedChunks = [];
// Schedule Message
// Toggle the schedule message section
function toggleScheduleMessage() {
    const scheduleSection = document.getElementById('schedule-section');
    if (scheduleSection.style.display === 'none') {
      scheduleSection.style.display = 'block';
    } else {
      scheduleSection.style.display = 'none';
    }
  }
  
  // Schedule the message to be sent at the specified time
  function scheduleMessage() {
    const scheduledTime = document.getElementById('schedule-time').value;
    const message = document.getElementById('scheduled-message-input').value;
  
    if (!scheduledTime || !message) {
      alert("Please select a time and type a message.");
      return;
    }
  
    const timeDifference = new Date(scheduledTime) - new Date();
  
    if (timeDifference < 0) {
      alert("Scheduled time cannot be in the past.");
      return;
    }
  
    setTimeout(() => {
      addMessageToChat(message);
    }, timeDifference);
  
    alert(`Message scheduled for ${new Date(scheduledTime).toLocaleString()}`);
    document.getElementById('scheduled-message-input').value = ''; // Clear the input field
    toggleScheduleMessage(); // Hide the schedule section
  }
  
  // Function to send a message
  function sendMessage() {
    const message = document.getElementById('message-input').value;
    if (message) {
      addMessageToChat(message);
      document.getElementById('message-input').value = ''; // Clear input field
    }
  }
  
  // Function to add the message to the chat box
  function addMessageToChat(message) {
    const chatBox = document.getElementById('chat-box');
    const newMessage = document.createElement('div');
    newMessage.className = 'message';
    newMessage.innerText = message;
    chatBox.appendChild(newMessage);
  }
  
// Call Functionality
let callTimer;
let seconds = 0;
function startCall() {
  const callModal = document.getElementById("call-modal");
  callModal.style.display = "block";

  callTimer = setInterval(() => {
    seconds++;
    document.getElementById("call-timer").innerText = `${Math.floor(seconds / 60)}:${seconds % 60}`;
  }, 1000);
}

function endCall() {
  clearInterval(callTimer);
  seconds = 0;
  document.getElementById("call-modal").style.display = "none";
  stopRecording();  // Ensure recording is stopped when call ends
}

// Call Recording
async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Audio recording is not supported in your browser.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    // Collect data chunks from the recording
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // When recording stops, create a Blob and provide a download link
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const audioURL = URL.createObjectURL(blob);
      const audioElem = document.getElementById("recording");
      audioElem.src = audioURL;
      audioElem.style.display = "block";
      recordedChunks = [];  // Clear the recorded chunks for the next recording
    };

    mediaRecorder.start();
    document.getElementById("start-recording").disabled = true;
    document.getElementById("stop-recording").disabled = false;

    console.log("Recording started...");
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    document.getElementById("start-recording").disabled = false;
    document.getElementById("stop-recording").disabled = true;
    console.log("Recording stopped...");
  }
}
// Predefined responses based on keywords
const contextResponses = {
  "hello": ["Hi! How can I help?", "Hello! What's up?", "Hey, how’s it going?"],
  "how are you": ["I'm good, thanks! How about you?", "I'm doing well, thank you.", "All good, and you?"],
  "bye": ["Goodbye!", "See you later!", "Take care!"],
  "thank you": ["You're welcome!", "No problem!", "Happy to help!"]
};

// Function to find suggestions based on input
function getSuggestions(input) {
  input = input.toLowerCase().trim();
  for (const [key, responses] of Object.entries(contextResponses)) {
    if (input.includes(key)) {
      return responses;
    }
  }
  return [];
}

// Function to show suggestions
function showSuggestions(suggestions) {
  const suggestion1 = document.getElementById("suggestion1");
  const suggestion2 = document.getElementById("suggestion2");
  const suggestion3 = document.getElementById("suggestion3");
  const suggestionsBox = document.getElementById("suggestions-box");

  if (suggestions.length === 0) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  suggestion1.innerText = suggestions[0] || "";
  suggestion2.innerText = suggestions[1] || "";
  suggestion3.innerText = suggestions[2] || "";

  suggestionsBox.classList.remove("hidden");
}

// Function to add selected suggestion to message box
function useSuggestion(suggestionText) {
  const messageInput = document.getElementById("message-input");
  messageInput.value = suggestionText;
  document.getElementById("suggestions-box").classList.add("hidden");
}

// Attach click event to suggestions
document.getElementById("suggestion1").addEventListener("click", () => useSuggestion(document.getElementById("suggestion1").innerText));
document.getElementById("suggestion2").addEventListener("click", () => useSuggestion(document.getElementById("suggestion2").innerText));
document.getElementById("suggestion3").addEventListener("click", () => useSuggestion(document.getElementById("suggestion3").innerText));

// Event listener for text input changes
document.getElementById("message-input").addEventListener("input", (e) => {
  const input = e.target.value;
  const suggestions = getSuggestions(input);
  showSuggestions(suggestions);
});

// Send button logic
document.getElementById("send-button").addEventListener("click", () => {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;
  
  if (message.trim() !== "") {
    // Logic to send the message goes here
    console.log("Message sent:", message);
    messageInput.value = ""; // Clear the input after sending
  }

  document.getElementById("suggestions-box").classList.add("hidden"); // Hide suggestions after sending
});

