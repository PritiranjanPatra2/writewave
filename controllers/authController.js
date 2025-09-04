import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js';
import cloudinary from "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
export const register =async (req,res)=>{
    try {
        const { fullName, username, email, password } = req.body;
        console.log(req.body.fullName);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({success:true, message: "User registered successfully",data:newUser });
    } catch (error) {
        res.status(500).json({ success:false, message: error.message });
    }
    }
  


export const login =async (req,res)=>{  
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ success: true, message: "Login successful", data:{
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar
            },
            token
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  
}
export const getProfile=async (req,res)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


        res.status(200).json({ success: true, message: "User is authenticated", data: user });
    } catch (error) {
        
    }
   
}
export const isAuth=async (req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        req.user=user;
        next();
    } catch (error) {
        
    }
   
}
// Edit/Update profile
export const updateProfile = async (req, res) => {
    try {
      let avatarUrl = null;
  
      // if user uploaded a new avatar
      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "write_wave_avatars",
          resource_type: "auto",
        });
  
        avatarUrl = result.secure_url;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          fullName: req.body.fullName,
          username: req.body.username,
          bio: req.body.bio,
          avatar: avatarUrl || req.user.avatar, // keep old avatar if no new one
        },
        { new: true, runValidators: true }
      ).select("-password"); // don’t send password back
  
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  