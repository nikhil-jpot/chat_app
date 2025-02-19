import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import {generateToken} from "../lib/utils.js"

export const signup=async (req,res)=>{
    const{email,fullName,password}=req.body;

    try {

        if(!fullName || !email || !password){
            return res.send(400).json({message:"All fields are required"});
        }

        if(password.length<6){
            return res.status(400).json({message:"Password must not be less tha 6"});
        }

        const user=await User.findOne({email});

        if(user){
            return res.status(400).json({message:"Email already exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            email,
            fullName,
            password:hashedPassword,
        })

        if(newUser){
            //generate JWT token
            generateToken(newUser._id,res);
            await newUser.save();

            return res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            });

        }else{
            res.status(400).json({message:"Invalid User Data"});
        }


        
    } catch (error) {
        console.log("Error in signup controler", error.message);
        res.status(400).json({message:"Internal server error"})
    }
}

export const login=async(req,res)=>{
    const {email,password}=req.body;

    try {
        const user=await User.findOne({email});
        
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        const isPasswordCorrect=await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        generateToken(user._id,res);

        res.status(201).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        });

    } catch (error) {
        console.log("Error in login route",error.route);
        res.status(500).json({message:"Internal Server Error"});
    }
    
}

export const logout=(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in logout route",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const {profilePic}=req.body;
        const userId=req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile Pic is required"});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic);
        const updatedUser=User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in profilePic Update",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth route",error.message);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}