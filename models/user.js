import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    default: 'https://i.postimg.cc/cCPwqGQz/discord-fake-avatar-decorations-1724674350651.gif',
  },
  phone_num: {
    type: String,
  },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  // Check if the password field is modified
  if (!this.isModified('password')) {
    return next(); // Skip hashing if the password hasn't changed
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Call next to continue with the save process
});

const User = mongoose.model('User', UserSchema);
export default User;
