import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import connect from './connection/connect.js';
import userRoutes from './Routes/userRoutes.js';
import chatRoutes from './Routes/chatRoutes.js'; // Chat routes
import cors from 'cors';
import setupSocketIO from './socket.js'; // Import socket setup

connect(); // Connecting to the database
console.log("js")
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = setupSocketIO(server);

// MIDDLEWARES
app.use(cors({
  origin: "https://6f442fe1-7375-46a2-8168-582717bd5cf1-00-100ylzjvhoza.pike.replit.dev",
  credentials: true,
})); // Configure CORS

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the dist directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Attach io to req if needed for routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ROUTES
app.use('/api/users', userRoutes); // User routes (login/signup)
app.use('/api/chat', chatRoutes);  // Chat routes

// Serve the frontend (React build)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
server.listen(port, () => {
  console.log("***")
})