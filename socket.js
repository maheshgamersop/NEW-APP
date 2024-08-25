// socket.js
import { Server } from 'socket.io';

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.url,
      methods: ["GET", "POST"],
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (data) => {
      console.log(`User joined: ${data}`);
      socket.join(data.chatId);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    // Listening for 'newUpdate' event
    socket.on('newUpdate', (chatId) => {
      io.to(chatId).emit('fullChat', { chatId });
    });
  });

  return io;
};

export default setupSocketIO;
