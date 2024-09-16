import axios from "axios";
import { Request, Response } from "express";
import User from "../models/User";

class AuthController {
  // FOR TESTING ONLY! DELETE BEFORE DEPLOYMENT
  static listAll = async (req: Request, res: Response) => {
    try {
      const userList = await User.find();
      if (!userList) {
        return res.status(404).json({
          code: 404,
          message: "Not found.",
        });
      }
      const userListOutput = userList.map((user) => {
        return {
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
}

export default AuthController;
