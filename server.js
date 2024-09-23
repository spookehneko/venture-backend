const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import CORS module

const app = express();
const server = http.createServer(app);

// List of allowed client origins (whitelisted domains)
const allowedOrigins = ['https://client.com', 'http://localhost:3000'];

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
    console.log('New user connected');

    // Set username
    socket.on('setUsername', (username) => {
        socket.username = username;
        socket.emit('message', `Welcome to the chat, ${username}!`);
        socket.broadcast.emit('message', `${username} has joined the chat`);
    });

    // Handle chat message
    socket.on('chatMessage', (msg) => {
        io.emit('message', `${socket.username}: ${msg}`);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        io.emit('message', `${socket.username || 'A user'} has left the chat`);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
