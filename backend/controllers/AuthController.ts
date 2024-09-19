import axios from "axios";
import { Request, Response } from "express";
import User from "../models/User";
import { hashCompare, hashMaker, signToken } from "../helpers";

class AuthController {
  // FOR TESTING ONLY! DELETE BEFORE DEPLOYMENT
  static listAll = async (req: Request, res: Response) => {
    try {
      const userList = await User.find().exec();
      if (!userList) {
        return res.status(404).json({
          code: 404,
          message: "Not found.",
        });
      }
      const userListOutput = userList.map((user) => {
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
        };
      });
      res.status(200).json({
        message: "User List (all)",
        data: userListOutput,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };

  // user registration
  // TODO: email confirmation
  static registration = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const isUsedEmail = await User.findOne({ email }).lean().exec();
      if (isUsedEmail) {
        return res.status(409).json({
          code: 409,
          message: "Email already used.",
        });
      }

      const hashedPw = await hashMaker(password);
      const newUser = await new User({
        name: name,
        email: email,
        password: hashedPw,
      }).save();
      console.log(
        `New registration: ${newUser.name} (${newUser.email}) at ${new Date().toUTCString()}`,
      );
      res.status(201).json({
        code: 201,
        message: "User registered.",
        payload: newUser,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // user login
  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const inUseEmail = await User.findOne({ email }).lean().exec();
      if (!inUseEmail) {
        return res.status(401).json({
          code: 401,
          message: "Incorrect email/password.",
        });
      }
      const isCorrectPassword = hashCompare(inUseEmail.password, password);
      if (!isCorrectPassword) {
        return res.status(401).json({
          code: 401,
          message: "Incorrect email/password.",
        });
      }
      const { _id, name } = inUseEmail;
      // Stay logined in 30 days
      // TODO: use methods other than cookies
      const payload = {
        name: name,
        email: email,
        token: `Bearer ${signToken({ _id: _id.toString(), name: name }, "30d")}`,
      };
      console.log(
        `User ${name} (${email}) login at ${new Date().toUTCString()}`,
      );
      res.status(200).json({
        code: 200,
        message: "Login successful.",
        payload,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // user logout
  static logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("token");
      res.status(200).json({
        code: 200,
        message: "Logout successful.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // user change password
  // auth needed
  static changePassword = async (req: Request, res: Response) => {
    try {
      const { password, confirm_password } = req.body;
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        if (password !== confirm_password) {
          return res.status(409).json({
            code: 409,
            message: "Confirm password does not match.",
          });
        }
        const user = await User.findById(_id);
        const hashedPw = await hashMaker(password);
        if (user) {
          user.password = hashedPw;
          await user.save();
          res.status(200).json({
            code: 200,
            message: "Password changed.",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
}

export default AuthController;
