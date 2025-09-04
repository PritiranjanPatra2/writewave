import express from 'express';
import { 
    createPost, 
    deletePost, 
    getAllPosts, 
    getPostById, 
    updatePost,
    likePost,
    commentPost,
    getTimelinePosts,
    getUserPosts,
    getComments
} from '../controllers/postController.js';
import { isAuth } from '../controllers/authController.js';
import multer from 'multer';

const postRoute = express.Router();  

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors (e.g., file size limit)
        return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
    } else if (err) {
        // Handle custom errors from fileFilter
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};

// Create post with image upload
postRoute.post('/', isAuth, upload.single('image'), handleMulterError, createPost);

// Get all posts (includes isLiked for authenticated users)
postRoute.get('/', isAuth, getAllPosts);

// Get post by ID (includes isLiked)
postRoute.get('/:id',isAuth, getPostById);

// Get user's posts (includes isLiked)
postRoute.get('/profile/:userId', getUserPosts);

// Get timeline posts (includes isLiked)
// Note: :userId is unused in controller; consider revising if intended to filter by user
postRoute.get('/timeline/:userId', getTimelinePosts);

// Update post
postRoute.put('/:id', isAuth, updatePost);

// Like/Unlike post
postRoute.put('/:id/like', isAuth, likePost);

// Comment on post
postRoute.put('/:id/comment', isAuth, commentPost);

// Get all comments of a post
postRoute.get('/:id/comments', getComments);

// Delete post
postRoute.delete('/:id', isAuth, deletePost);

export default postRoute;