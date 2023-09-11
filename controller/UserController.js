const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth")

class AdminController {

  async profile(req, res) {
    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if (data) {
        return res.status(200).json(success("Data Has Found",data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async add_review(req, res) {
    try {
      const { productId, rating,comment } = req.body;
      const auth = await Auth.findById(req.id);
     

      // Assume you have the productId and userId available
      const newReview = new Review({
        product: productId,
        user: auth.user, 
        rating: rating, 
        comment, 
      });

      // Save the new review document to the database
      const data = await newReview.save();

      if (data) {
        return res.status(200).json(success("Data Has been saved succesfully",data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

}

module.exports = new AdminController();
