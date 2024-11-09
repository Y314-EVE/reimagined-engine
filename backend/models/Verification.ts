import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
