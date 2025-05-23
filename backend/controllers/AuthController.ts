import { Request, Response } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User";
import Verification from "../models/Verification";
import TokenPair from "../models/TokenPair";
import { hashCompare, hashMaker, signToken, verifyToken } from "../helpers";

const EMAIL = process.env.EMAIL || "";
const EMAILPW = process.env.EMAILPW || "";
const SENDER = process.env.SENDER || EMAIL || "";

class AuthController {
  // user info
  static userInfo = async (req: Request, res: Response) => {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const user = await User.findById(_id).exec();
        if (user) {
          const { name, email } = user;
          res.status(200).json({
            code: 200,
            message: "User info",
            payload: {
              name: name,
              email: email,
            },
          });
        }
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

  // user registration
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
        `New registration: ${newUser.name} (${
          newUser.email
        }) at ${new Date().toUTCString()}`,
      );

      // send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: EMAIL,
          pass: EMAILPW,
        },
      });

      const token = crypto.randomBytes(32).toString("hex");

      const mailOptions = {
        from: SENDER,
        to: email,
        subject: "Fitness Coach LLM email verification",
        html: `
        <p>Thank you for registering with Fitness Coach LLM!</p>
        <br/>
        <p>Please click on the following link to verify your email address:</p>
        http://localhost:5003/api/auth/verify-email/${token}/${email}`,
      };

      const newVerification = await new Verification({
        token: token,
        email: email,
        expireAt: new Date(Date.now() + 6048e5),
      }).save();

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err.message);
          res.status(500).json({
            code: 500,
            message: "Internal server error. Email send failed.",
          });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            code: 200,
            message: "Verification email sent successfully.",
          });
        }
      });

      res.status(201).json({
        code: 201,
        message: "User register sucessful.",
        payload: {
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };

  // send reset email (forgot password)
  static sendResetEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const isUsedEmail = await User.findOne({ email }).lean().exec();
      if (!isUsedEmail) {
        return;
      }

      // send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: EMAIL,
          pass: EMAILPW,
        },
      });

      const token = crypto.randomBytes(32).toString("hex");

      const mailOptions = {
        from: SENDER,
        to: email,
        subject: "Fitness Coach LLM password reset",
        html: `
          <p>Thank you for registering with Fitness Coach LLM!</p>
          <br/>
          <p>Please click on the following link to reset your password:</p>
          http://localhost:5173/reset-password/${token}/${email}
        `,
      };

      const newVerification = await new Verification({
        token: token,
        email: email,
        expireAt: new Date(Date.now() + 900000),
      }).save();

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err.message);
          res.status(500).json({
            code: 500,
            message: "Internal server error. Email send failed.",
          });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            code: 200,
            message: "Verification email sent successfully.",
          });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // reset password
  static resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, email, password, confirmPassword } = req.body;

      const user = await User.findOne({ email: email }).exec();
      if (!user) {
        return res.status(404).json({ code: 404, message: "Email not found." });
      }
      const record = await Verification.findOne({
        token: token,
        email: email,
      }).exec();

      if (!record || record.expireAt < new Date(Date.now())) {
        res
          .status(401)
          .json({ code: 401, message: "Verification link expired." });
      } else {
        if (user && user.verifiedAt !== null) {
          if (password === confirmPassword) {
            const hashedPw = await hashMaker(password);
            user.password = hashedPw;
          }
          await user.save();
        }
        console.log(`${email} password reset by ${new Date().toUTCString()}`);
        res.status(200).json({ code: 200, message: "Password reset." });
      }
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
      const inUseEmail = await User.findOne({ email: email }).lean().exec();
      if (!inUseEmail) {
        return res.status(401).json({
          code: 401,
          message: "Incorrect email/password.",
        });
      }
      if (!inUseEmail.verifiedAt) {
        return res
          .status(401)
          .json({ code: 401, message: "Email not verified." });
      }
      const isCorrectPassword = await hashCompare(
        inUseEmail.password,
        password,
      );
      if (!isCorrectPassword) {
        return res.status(401).json({
          code: 401,
          message: "Incorrect email/password.",
        });
      }
      const { _id, name } = inUseEmail;
      // Stay logined in 30 days
      // TODO: use rotational refresh token
      const newTokenPair = await TokenPair.create({
        user: _id,
        accessToken: `Bearer ${signToken(
          { _id: _id.toString(), name: name },
          "15m",
        )}`,
        refreshToken: `Bearer ${signToken(
          { _id: _id.toString(), name: name },
          "30d",
        )}`,
        expireAt: new Date(Date.now() + 30 * 864e5),
      });
      const payload = {
        name: name,
        email: email,
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
      };
      await newTokenPair.save();
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
      const { accessToken, refreshToken } = req.body;
      const tokenPair = await TokenPair.findOne({
        accessToken: accessToken,
        refreshToken: refreshToken,
        invalidatedAt: { $eq: null },
      }).exec();
      if (tokenPair) {
        tokenPair.invalidatedAt = new Date(Date.now());
        await tokenPair.save();
      }
      // res.clearCookie("access_token");
      // res.clearCookie("refresh_token");
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
      const { password, newPassword, confirmPassword } = req.body;
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        if (newPassword !== confirmPassword) {
          return res.status(409).json({
            code: 409,
            message: "Confirm password does not match.",
          });
        }
        const user = await User.findById(_id).exec();
        const hashedNewPw = await hashMaker(newPassword);

        if (user) {
          const correctPassword = await hashCompare(user!.password, password);
          if (!correctPassword) {
            return res.status(401).json({
              code: 401,
              message: "Incorrect password.",
            });
          }
          user.password = hashedNewPw;
          await user.save();
          res.status(200).json({
            code: 200,
            message: "Password changed.",
          });
        }
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
  // user change name
  static updateName = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const user = await User.findById(_id);
        if (user) {
          user.name = name;
          await user.save();
          res.status(200).json({
            code: 200,
            message: "Password changed.",
          });
        }
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
  // send email verification
  static sendEmailVerification = async (req: Request, res: Response) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: EMAIL,
          pass: EMAILPW,
        },
      });

      const { email } = req.body;
      const token = crypto.randomBytes(32).toString("hex");

      const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "Fitness Coach LLM email verification",
        html:
          "<p>Please click on the following link to verify your email address:</p>" +
          '<a href="http://localhost:5003/api/auth/verify-email/' +
          token +
          "/" +
          email +
          '">http://localhost:5003/api/auth/verify-email/' +
          token +
          "/" +
          email +
          "</a>",
      };

      const newVerification = await new Verification({
        token: token,
        email: email,
        expireAt: new Date(Date.now() + 1800000),
      }).save();

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err.message);
          res.status(500).json({
            code: 500,
            message: "Internal server error. Email send failed.",
          });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            code: 200,
            message: "Verification email sent successfully.",
          });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // verify email
  static verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token, email } = req.params;

      const user = await User.findOne({ email: email }).exec();
      if (!user) {
        return res.status(404).json({ code: 404, message: "Email not found." });
      }
      const record = await Verification.findOne({
        token: token,
        email: email,
      }).exec();

      if (!record || record.expireAt < new Date(Date.now())) {
        res
          .status(401)
          .json({ code: 401, message: "Verification link expired." });
      } else {
        const verifiedAt = new Date(Date.now());
        if (user) {
          user.verifiedAt = verifiedAt;
          await user.save();
        }
        console.log(`${email} is verified by ${verifiedAt}`);
        res.status(200).json({ code: 200, message: "Email verified." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  };
  // check access-refresh token pair
  static updateTokenPair = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (typeof req.user !== "string") {
        const { _id, name } = req.user;
        const record = await TokenPair.findOne({
          user: _id,
          refreshToken: refreshToken,
        }).exec();

        if (
          !record ||
          record.expireAt < new Date(Date.now()) ||
          record.invalidatedAt !== null
        ) {
          res.status(401).json({
            code: 401,
            message: "Token pair expired or used already.",
          });
        } else {
          const newTokenPair = await TokenPair.create({
            user: _id,
            accessToken: `Bearer ${signToken(
              { _id: _id.toString(), name: name },
              "15m",
            )}`,
            refreshToken: `Bearer ${signToken(
              { _id: _id.toString(), name: name },
              "30d",
            )}`,
            expireAt: new Date(Date.now() + 30 * 864e5),
          });
          record.invalidatedAt = new Date(Date.now());
          await record.save();
          await newTokenPair.save();
          res.status(200).json({
            code: 200,
            message: "Token pair verified.",
            refreshToken: newTokenPair.refreshToken,
            accessToken: newTokenPair.accessToken,
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
