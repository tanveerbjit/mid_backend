const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");

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

}

module.exports = new AdminController();
