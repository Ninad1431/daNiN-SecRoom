// static/script.js
const socket = io.connect('https://' + document.domain + ':' + location.port);

socket.on('message', function(data) {
    appendMessage(data);
    updateActiveUsers(data.activeUsers); // Update the active user count
});

let currentCode = null;
let currentUsername = null;

socket.on('leave', function() {
    alert('Session ended.');
    // Optionally, you can add additional logic to handle UI changes after leaving the session.
});

function joinChat() {
    const codeInput = document.getElementById('code-input');
    const usernameInput = document.getElementById('username-input');

    currentCode = codeInput.value;
    currentUsername = usernameInput.value;

    if (currentCode.trim() !== '' && currentUsername.trim() !== '') {
        socket.emit('join', { code: currentCode, username: currentUsername });
        // Update the header with the current room code
        updateHeader(currentCode);
        codeInput.disabled = true;
        usernameInput.disabled = true;
        document.getElementById('join-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
    } else {
        alert('Please enter a code and username.');
    }
}

// Function to update the header with the current room code and active users
function updateHeader(roomCode, activeUsers) {
    const header = document.getElementById('header');
    const headerText = `daNiN SecRoom : ${roomCode}`;
    const activeUsersText = activeUsers !== undefined ? `Active Users: ${activeUsers}` : '';
    header.innerHTML = `<h1>${headerText}</h1><p>${activeUsersText}</p>`;
}

document.getElementById('message-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        socket.emit('message', { message: message, code: currentCode, username: currentUsername });
        messageInput.value = '';
    }
}

function leaveSession() {
    socket.emit('leave', { code: currentCode, username: currentUsername });
    location.reload();  // Simulate leave session by refreshing the page
}

// Define the appendMessage function
function appendMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');

    let isCurrentUser = data.username === currentUsername;
    let messageText = `<strong style="color: ${getColorForUsername(data.username)}">${data.username}${isCurrentUser ? ' (You)' : ''}:</strong> ${data.message}`;
    messageDiv.innerHTML = messageText;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom
}

function getColorForUsername(username) {
    const hash = username.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 70%)`; // Use HSL color for better differentiation
}

// Function to update the active user count in the header
function updateActiveUsers(activeUsers) {
    // Call the updateHeader function with the current room code and active users
    if (activeUsers !== undefined) {
        updateHeader(currentCode, activeUsers);
    }
}