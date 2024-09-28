import { Request, Response } from "express";
import Chat from "../models/Chat";

class ChatController {
  static listChats = async (req: Request, res: Response) => {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const chatList = await Chat.find({ user: _id })
          .sort({ createdAt: "desc" })
          .exec();
        if (!chatList) {
          return res.status(404).json({
            code: 404,
            message: "Chat history not found.",
          });
        }
        const chatListOutput = chatList.map((chat) => {
          return {
            _id: chat._id,
            title: chat.title,
            createdAt: chat.createdAt.toUTCString(),
          };
        });
        res.status(200).json({
          message: "Get chat history sucessful.",
          data: chatListOutput,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  static getChat = async (req: Request, res: Response) => {
    try {
      const reqChatId = req.body._id;
      const chat = await Chat.findById(reqChatId).exec();
      await chat?.populate("messages");
      if (!chat || !req.user) {
        res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      } else if (typeof req.user !== "string") {
        const { _id } = req.user;
        if (typeof _id === "string" && _id !== chat.user.toString()) {
          return res.status(401).json({
            code: 401,
            message: "Unauthorized access.",
          });
        }
      }
      res.status(200).json({
        code: 200,
        message: "Get chat successful.",
        data: chat,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  static create = async (req: Request, res: Response) => {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const newChat = await new Chat({
          user: _id,
          title: "Untitled",
        }).save();
        res.status(201).json({
          code: 201,
          message: "New chat created",
          payload: newChat,
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  static delete = async (req: Request, res: Response) => {
    try {
      const { _id } = req.body;
      const chat = await Chat.findById(_id).exec();
      if (!chat) {
        return res.status(404).json({
          code: 404,
          message: "Chat not found",
        });
      }
      if (!req.user || typeof req.user === "string") {
        return res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      }
      const user = req.user._id;
      if (typeof user === "string" && chat.user.toString() !== user) {
        return res.status(401).json({
          code: 401,
          message: "Unauthorized access.",
        });
      }
      await chat.deleteOne();
      res.status(200).json({
        code: 200,
        message: "Chat deleted.",
      });
    } catch (err) {
      console.log(err);
    }
  };
  static changeTitle = async (req: Request, res: Response) => {
    try {
      const { _id } = req.body;
      const chat = await Chat.findById(_id).exec();
      if (!chat) {
        return res.status(404).json({
          code: 404,
          message: "Chat not found",
        });
      }
      if (typeof req.user === "string") {
        return res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      }
      const user = req.user._id;
      if (typeof user === "string" && chat.user.toString() !== user) {
        return res.status(401).json({
          code: 401,
          message: "Unauthorized access.",
        });
      }
      const { title } = req.body;
      if (title && title.trim() !== "") {
        chat.title = title;
        await chat.save();
        res.status(201).json({
          code: 201,
          message: "Title changed.",
        });
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

export default ChatController;
