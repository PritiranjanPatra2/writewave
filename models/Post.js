import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String },
  location: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:[]}], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  shares: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

export default Post;