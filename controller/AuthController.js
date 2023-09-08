const User = require("../model/User");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../model/Auth")
const LoginAttempt = require("../model/LoginAttemptLimit"); 

class AuthController {



  //// login
  async login(req, res){

    try {

      const ip = req.ip.split(":").pop();
      let block = false;
      let limit;

      const { email, password } = req.body;

      const auth = await Auth.findOne({ email }).populate(
        "user",
        "-_id -__v -createdAt -updatedAt"
      );

      ////////////// rate Limiter check
      if (auth) {
        limit = await LoginAttempt.findOne({
          email,
          ip,
          limit: { $gte: process.env.LIMIT },
        });

        if (limit) {
          const timestamp = new Date(limit.timestamp);
          const timeDifference = new Date() - timestamp;

          // hit is crossing the limit during a time period
          if (timeDifference < 1 * 60 * 1000) {
            // The time difference is less than 1 minutes
            block = true;
          } else {
            const unblockTime = new Date(
              limit.timestamp.getTime() + 1 * 60 * 1000
            ); // Unblock after 20 minutes
            if (unblockTime <= new Date()) {
              await LoginAttempt.deleteOne({ email, ip });
            }
          }
        }

        if (block) {
          // User has exceeded the login attempts limit
           return res.status(403).json(failure("Login attempts limit exceeded. Try again later."));
        }
      }

      // compare password with hashedpassword
      if (auth && (await bcrypt.compare(password, auth.password))) {
        const {role, email, _id } = auth;

        const accessToken = jwt.sign(
          {
            user: {
              email,
              _id,
              role,
            },
          },
          process.env.ACCESS_TOKEN_SECERT,
          {expiresIn:"1h"}
        );

        res.cookie("token", accessToken, {
          httpOnly: true, // Make the cookie accessible only via HTTP(S)
          maxAge: 3600000, // Set the cookie expiration time (1 Hour in milliseconds)
        });

        const { user } = auth;
        if (block) {
          block.finOneAndDelete({ email, ip });
        }

        return res.status(200).json(success(user));
      } else {
        await LoginAttempt.findOneAndUpdate(
          { email, ip },
          { $setOnInsert: { email, ip }, $inc: { limit: 1 } },
          { upsert: true, new: true }
        );
  
        return res.status(401).json(failure("email or password is not valid"));
     
      }

      
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
     
  }


  ///// registration
  async registration(req, res){

      try {
        const { first_name, last_name, user_name, email, password } = req.body;

        const userAvailable = await Auth.findOne({ email });

        //// chek if user is already exist or not
        if (userAvailable) {
          return res.status(400).json(failure("User already registered!"));
        }

        ////Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        /// insert user into database 
        const user = new User({
          first_name,
          last_name,
          user_name,
          email,
          password: hashedPassword,
          role:req.role,
        });

        await user.save();

        const auth = new Auth({
          email,
          password: hashedPassword,
          role: req.role,
          user: user._id,
        });

        await auth.save();

        //// create token
        const accessToken = jwt.sign(
          {
            user: {
              email,
              _id:auth._id,
              role: req.role,
            },
          },
          process.env.ACCESS_TOKEN_SECERT,
          { expiresIn: "1h" }
        );

        res.cookie("token", accessToken, {
          httpOnly: true, // Make the cookie accessible only via HTTP(S)
          maxAge: 900000, // Set the cookie expiration time (15 minutes in milliseconds)
        });

        return res.status(200).json(success(user));
        
      } catch (error) {
       console.log(error);
        return res.status(500).json(failure("Internal Server Error"));
      }


  }



  /////////// Logout 
  async logout(req, res){
        try {
          res.clearCookie("token");
          res.clearCookie("google-auth-session");
          return res.status(200).json(success("LogOut"));

        } catch (error) {
          return res.status(500).json(failure("Internal Server Error"));
        }
  }




}

module.exports = new AuthController();
