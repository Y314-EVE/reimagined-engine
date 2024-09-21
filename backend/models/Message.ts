import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    bot: {
      type: Boolean,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    context: {
      type: Array<Number>,
    },
  },
  { timestamps: true, versionKey: false },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
