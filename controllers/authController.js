import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js';
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
export const isAuth=async (req,res)=>{
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