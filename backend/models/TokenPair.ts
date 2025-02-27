import mongoose from "mongoose";

const tokenPairSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expireAt: {
      type: Date,
      required: true,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

const TokenPair = mongoose.model("TokenPair", tokenPairSchema);

export default TokenPair;
