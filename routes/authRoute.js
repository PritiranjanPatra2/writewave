import express from 'express'
import { isAuth, login, register, getProfile, updateProfile } from '../controllers/authController.js';
import multer from 'multer';

const authRoute = express.Router();

// Multer storage in memory
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Multer config
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

// Routes
authRoute.post('/login', login);
authRoute.post('/register', register);
authRoute.get('/profile', getProfile);
authRoute.put("/update", isAuth, upload.single("avatar"), updateProfile);

export default authRoute;
