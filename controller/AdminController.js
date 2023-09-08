const asyncHandler = require("express-async-handler");
const Product = require("../model/Product");
const User = require("../model/User");
const success = require("../helpers/success");
const failure = require("../helpers/failed");

class AdminController {


  async profile(req, res){

    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if(data){
        return res.status(200).json(success("Data Has Found",data));
      }else{
        return res.status(404).json(failure("Data Does not found"));
      }
      
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }


  }

  async all_vendors(req, res){

    try {
      const data = await User.find({}, "-_id -__v -createdAt -updatedAt");
       if (data.length > 0) {
         return res.status(200).json(success("Data Has Found", data));
       } else {
         return res.status(404).json(failure("Data Does not found"));
       }
      
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }

  }

  async users_with_user_role(req, res){

   try {
      const data = await User.where("role")
    .eq("u")
    .select("-_id -__v -createdAt -updatedAt");
       if (data.length > 0) {
         return res.status(200).json(success("Data Has Found", data));
       } else {
         return res.status(404).json(failure("Data Does not found"));
       }
      
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async users_with_admin_role(req, res){

    try {
      const data = await User.where('role').eq('a').select("-_id -__v -createdAt -updatedAt");
       if (data.length > 0) {
         return res.status(200).json(success("Data Has Found", data));
       } else {
         return res.status(404).json(failure("Data Does not found"));
       }
      
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
    
  }
  
}


module.exports = new AdminController()