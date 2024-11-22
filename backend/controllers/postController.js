import { Response } from "../utils/response.js"
import User from "../models/userModel.js";
import Post from "../models/userModel.js";
import cloudinary from "cloudinary";
import { ReturnDocument } from "mongodb";
import { message } from "../utils/message.js";


export const createPost=async(req,res)=>{
    try {
        //parsing body data
        const {image , caption, location, message}=req.body

        //check body data
        if(!caption){
            return Response(res,404,false,message.missingFieldMessage);
        }

        if(!image){
            return Response(res,404,false,message.imagemissingMessage);
        }

        //Upload image 
        const imageResult = await cloudinary.v2.uploader.upload(image,{
            folder: 'posts'
        })

        //create post
        const post = await Post.create({
            image: {
                public_id: imageResult.public_id,
                url:  imageResult.secure_url,
            },
            caption,
            location,
            mentions,
            owner: req.user._id,
        })


        //add psot on user's posts array
        const user = await User.findById(req.user._id);
        user.posts.push(post._id)
        await user.save();

        //send reponse
        Response(res, 201,true, message.postCreateMessage, post);
        
        
    } catch (error) {
        Response(res,500,false,error.message);
    }
}


export const getAllPosts = async(req,res)=>{
    try{
        //get all posts 
        const posts = await Post.find().populate('owner','username firstname avatar')

        //check posts 
        if(posts.length==0){
            return Response(res,404,false , message.postsFoundMessage);
        }

        //send Response
        Response(res,200,true, message.postsFoundMessage,posts);

    }catch(error){
        Response(res,500,false,error.message);
    }
}

export const getPostById = async (req, res) => {
    try{
        //Parsing params
        const { id } = req.params

        //find post
        const post = await Post.findById(id).populate('owner', 'username firstName Avatar');

        //check post 
        if(!post){
            return Response(res, 404, false, message.postNotFoundMessage);
        }

        //send response
        Response(res, 200, true, message.postsFoundMessage, post);

    } catch (error){
        Response(res, 500, false, error.message);
    }
}

export const getMyPosts = async (req, res) => {
    try{
        //get my post
        const posts = await Post.find({ owner: req.user._id }).populate('owner', 'username firstName avatar');

        //check post
        if(posts.length === 0){
            return Response(res, 404, false, message.postNotFoundMessage);
        }

        //send response
        Response(res, 200, true, message.postsFoundMessage, posts);

    } catch(error){
        Response(res, 500, false, error.message);
    }
}