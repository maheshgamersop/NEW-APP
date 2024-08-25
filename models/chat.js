import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  chatName: { type: String, required: true }, // Renamed for clarity
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Changed to an array
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Only relevant for group chats
  isGroupChat: { type: Boolean, default: false },
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
