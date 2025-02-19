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

export const login=(req,res)=>{
    
}

export const logout=(req,res)=>{
    
}