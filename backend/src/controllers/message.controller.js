import User from "../models/user.model.js";
import Message from "../models/message.model.js";


export const getUsersForSidebar=async(req,res)=>{
    try {
        const loggedInUserId=req.user._id;
        const filteredUser=await User.find({_id: {$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUser);
    } catch (error) {
        console.log("Error in getUsersFrmSidebar:",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}

export const getMessages=async(req,res)=>{
    try {
        const{id:otherId}=req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:otherId,receiverId:myId},
                {senderId:myId,receiverId:otherId}
            ],
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages:",error.message);
        res.status(500).json({error:"Internal Server Error"});
        
    }
}

export const sendMessage=async(req,res)=>{
    try {
        const{text,image}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
    if(image){
        //clodinary upload base64 image
        const uploadResponse=await cloudinary.uploader.upload(image);
        imageUrl=uploadResponse.secure_url;
    }

    const newMessage=await new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl,
    })

    //to-do Real Time functionality using Sicket.io
    await newMessage.save();

    res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in send Message controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}