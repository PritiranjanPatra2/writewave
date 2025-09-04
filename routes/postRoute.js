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
    getUserPosts
} from '../controllers/postController.js';
import { isAuth } from '../controllers/authController.js';
import multer from 'multer';
import { getComments } from '../controllers/postController.js';

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

postRoute.post('/', isAuth, upload.single('image'), createPost);

// Get all posts
postRoute.get('/', getAllPosts);

// Get post by ID
postRoute.get('/:id', getPostById);

// Get user's posts
postRoute.get('/profile/:userId', getUserPosts);

// Get timeline posts
postRoute.get('/timeline/:userId', getTimelinePosts);

// Update post
postRoute.put('/:id', isAuth, updatePost);

// Like/Unlike post
postRoute.put('/:id/like', isAuth, likePost);

// Comment on post
postRoute.put('/:id/comment', isAuth, commentPost);
postRoute.get('/:id/comments', getComments);

// Delete post
postRoute.delete('/:id', isAuth, deletePost);

export default postRoute;