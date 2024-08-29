import {Server} from 'socket.io'
const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://6f442fe1-7375-46a2-8168-582717bd5cf1-00-100ylzjvhoza.pike.replit.dev "
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (data) => {
      console.log(`User joined chat: ${data.chatId}`);
      socket.join(data.chatId); // Join the specified chat room
    });

    socket.on('newUpdate', (chatId, message) => {
      // Emit the new message only to the users in the specified chat room
      io.to(chatId).emit('fullChat', message); 
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io;
};

export default setupSocketIO;
