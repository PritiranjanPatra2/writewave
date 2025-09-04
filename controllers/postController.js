import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import cloudinary from 'cloudinary';
import User from "../models/User.js";

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const createPost = async (req, res) => {
    try {
        let imageUrl = null;
           const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
        
        if (req.file) {
            // Convert buffer to base64
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            
            // Upload to cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'write_wave_posts',
                resource_type: 'auto'
            });
            imageUrl = result.secure_url;
        }

        const newPost = new Post({
            user: req.user._id,
            content: req.body.content,
            image: imageUrl,
            location: req.body.location
        });
        
        const savedPost = await newPost.save();
        // user.posts.push(savedPost._id); 
        // await user.save();

        res.status(201).json({ success: true, message: "Post created successfully", data: savedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user likes comments', 'fullName username avatar')
            .sort({ timestamp: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get post by ID
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'fullName username avatar')
            .populate('comments');
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'fullName username avatar')
            .sort({ timestamp: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get timeline posts
export const getTimelinePosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'fullName username avatar')
            .sort({ timestamp: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update post
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only update your own posts" });
        }
        
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {
                content: req.body.content,
                image: req.body.image,
                location: req.body.location
            },
            { new: true }
        ).populate('user', 'fullName username avatar');
        
        res.status(200).json({ success: true, message: "Post updated successfully", data: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Like/Unlike post
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log(post);
        
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        // Initialize likes array if it doesn't exist
        if (!post.likes) {
            post.likes = [];
        }
        
        const isLiked = post.likes.some(like => like.toString() === req.user._id.toString());
        
        if (isLiked) {
            // User already liked the post, remove like
            await Post.findByIdAndUpdate(req.params.id, {
                $pull: { likes: req.user._id }
            });
            res.status(200).json({ 
                success: true, 
                message: "Post unliked successfully",
                liked: false
            });
        } else {
            // User hasn't liked the post yet, add like
            await Post.findByIdAndUpdate(req.params.id, {
                $addToSet: { likes: req.user._id }
            });
            res.status(200).json({ 
                success: true, 
                message: "Post liked successfully",
                liked: true
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Comment on post
export const commentPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        const newComment = new Comment({
            user: req.user._id,
            post: post._id,
            text: req.body.text
        });
        
        const savedComment = await newComment.save();
        post.comments.push(savedComment._id);
        await post.save();
        
        res.status(200).json({ success: true, message: "Comment added successfully", data: savedComment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get all comments of a post
// postController.js
export const getComments = async (req, res) => {
    try {
      const { id } = req.params; // postId
      const post = await Post.findById(id)
        .populate({
          path: "comments",
          populate: { path: "user", select: "username fullName" } // if Comment has user field
        });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      res.status(200).json(post.comments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
  };
    
// Delete post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own posts" });
        }
        
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};