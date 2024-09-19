import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const registerValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .messages({ "any.required": "Name is required" }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email address or format",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .required()
      .min(8)
      .max(64)
      .pattern(new RegExp("^[a-zA-Z0-9#?!@$ %^&*-]{8,64}$"))
      .messages({
        "string.min": "The password must be at least 8 characters long",
        "string.max": "The password must not exceed 64 characters",
        "any.required": "Password is required",
        "string.pattern.base":
          "The password can only be consist of alphanumeric characters and special characters including:#?!@$ %^&*-",
      }),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.required": "Confirm password is required",
        "any.only": "The password does not match",
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    const message = error.details[0].message;
    return res.status(400).json({ error: message });
  }
  next();
};
