import { Request, Response } from "express";
import axios from "axios";
import Message from "../models/Message";
import Chat from "../models/Chat";
import { io, socket } from "../server";
import { ObjectId } from "mongoose";
import { options } from "joi";

interface MessageProps {
  _id: ObjectId;
  bot: boolean;
  content: string;
  createdAt: string;
}

class MessageController {
  static listMessages = async (req: Request, res: Response) => {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const messageList = await Message.find({ user: _id }).exec();
        if (!messageList) {
          return res.status(404).json({
            code: 404,
            message: "Message history not found.",
          });
        }

        res.status(200).json({
          message: "Get message history sucessful.",
          data: messageList,
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
  static getMessage = async (req: Request, res: Response) => {
    try {
      const reqMessageId = req.body._id;
      const message = await Message.findById(reqMessageId)
        .populate("Message")
        .exec();
      if (!message || !req.user) {
        res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      } else if (typeof req.user !== "string") {
        const { _id } = req.user;
        if (
          message.user &&
          typeof _id === "string" &&
          _id !== message.user.toString()
        ) {
          return res.status(401).json({
            code: 401,
            message: "Unauthorized access.",
          });
        }
      }
      res.status(200).json({
        code: 200,
        message: "Get message successful.",
        data: message,
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
        const { chat, content } = req.body;
        const chatTarget = await Chat.findById(chat).exec();
        if (
          chatTarget &&
          typeof _id === "string" &&
          chatTarget.user.toString() !== _id
        ) {
          return res.status(401).json({
            code: 401,
            Message: "Unauthorize access.",
          });
        }

        const message =
          chatTarget && chatTarget.messages.length > 0
            ? await Message.findById(
                chatTarget.messages[chatTarget.messages.length - 1]
              )
            : null;
        const context = message ? message.context : [];

        const newMessage = await new Message({
          chat: chat,
          user: _id,
          context: context,
          content: content,
          bot: false,
        }).save();
        const respondMessage = await new Message({
          chat: chat,
          user: _id,
          content: "Thinking...",
          bot: true,
        }).save();
        chatTarget?.messages.push(newMessage._id, respondMessage._id);
        await chatTarget?.save();
        io.to(chat.toString()).emit("receive message", newMessage);
        res.status(201).json({
          code: 201,
          message: "New message created",
          payload: newMessage,
          respond: respondMessage._id,
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

  static getResponse = async (req: Request, res: Response) => {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const { chat, prompt, respond } = req.body;
        const promptMessage = await Message.findById(prompt).exec();
        const respondMessage = await Message.findById(respond).exec();
        const historyMessages = await Chat.findById(chat)
          .populate<{ messages: Array<MessageProps> }>("messages")
          .exec();
        const history: Array<Object> = [
          {
            role: "system",
            content:
              "<role>You are a friendly fitness coach that gives personalized fitness advice in details, give detailed instructions on the exercises.</role> <task>Relate to your tasks when the user asks things not directly related to fitness training. Jokes if totally unrelated and do not answer the question.</task> <format>You can use markdown language to structure the output for longer paragraphs.</format> <task>Create training schedules, training plans, do it whenever possible even if not explicitly asked to do so.</task> <task>Ask for body metrics and status of user that can help you personalize their training. If user rejected, don't ask again.</task> <task>If there is any nutrition advice that can help, please include as well.</task>",
          },
        ];
        if (historyMessages) {
          for (var i = 0; i < historyMessages.messages.length; i++) {
            if (historyMessages.messages[i]._id.toString() === respond) {
              break;
            }
            if (historyMessages.messages[i].bot) {
              history.push({
                role: "assistant",
                content: historyMessages.messages[i].content,
              });
            } else {
              history.push({
                role: "user",
                content: historyMessages.messages[i].content,
              });
            }
          }
        }
        if (typeof _id === "string" && promptMessage && respondMessage) {
          if (
            promptMessage.user?._id.toString() === _id &&
            respondMessage.user?._id.toString() === _id
          ) {
            // const promptResponse = await axios.post(
            //   "http://localhost:11434/api/generate",
            //   {
            //     model: "hf.co/Eve-31415/fitness-training",
            //     // model: "llama3.1",
            //     prompt: promptMessage.content,
            //     context: promptMessage.context,
            //     stream: false,
            //   }
            // );
            const promptResponse = await axios.post(
              "http://localhost:11434/api/chat",
              {
                model: "hf.co/Eve-31415/fitness-training",
                messages: history,
                stream: false,
                options: {
                  num_ctx: 65536,
                  num_predict: -2,
                  temperature: 0.5,
                  top_p: 0.9,
                },
              }
            );
            const { message } = promptResponse.data;
            respondMessage.content = message.content;
            await respondMessage.save();
            io.to(chat.toString()).emit("receive message", respondMessage);
            res.status(200).json({
              code: 200,
              message: "Prompt successful.",
              data: respondMessage,
            });
          }
        } else {
          return res.status(500).json({
            code: 500,
            message: "Internal server error.",
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

  static delete = async (req: Request, res: Response) => {
    try {
      const { _id } = req.body;
      const message = await Message.findById(_id).exec();
      if (!message) {
        return res.status(404).json({
          code: 404,
          message: "Message not found",
        });
      }
      if (!req.user || typeof req.user === "string") {
        return res.status(500).json({
          code: 500,
          message: "Internal server error.",
        });
      }
      const user = req.user._id;
      if (message.user !== user) {
        return res.status(401).json({
          code: 401,
          message: "Unauthorized access.",
        });
      }
      await message.deleteOne();
      res.status(200).json({
        code: 200,
        message: "Message deleted.",
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default MessageController;
