import { NextFunction, Request, Response } from "express";
import User, { UserWithId } from "../models/userModel";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> => {
  const { name, lastname, email, password } = req.body;

  if (!name || !lastname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
  if (!regex.test(email)) res.status(422).json({ message: "Invlid email" });

  if (password.length < 6) {
    res
      .status(403)
      .json({ message: "Password must at least 6 characters long" });
  }

  const userExist: UserWithId | null = await User.findOne({ email });

  if (userExist) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user: UserWithId = await User.create({
    name,
    lastname,
    email,
    password,
  });

  // NOTE Session !!!
  req.session.user = { ...user };

  if (user) {
    // NOTE Exclude password
    return res.json({
      data: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } else {
    return res.status(400).json({ message: "Invalid user data" });
    // TODO throw error
  }
};

export const auth = async (
  req: Request,
  res: Response
): Promise<unknown | void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
  if (!regex.test(email)) res.status(422).json({ message: "Invlid email" });

  const user: UserWithId | null = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // NOTE Session !!!
    req.session.user = { ...user };

    // NOTE Exclude password
    return res.json({
      data: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // req.session.cookie = {
  //   httpOnly: true,
  //   expires: new Date(0),
  // };
  req.session.destroy((err: any) => {
    if (err) console.log("Logout Error: ", err);
  });
  res.status(200).json({ message: "User logged out" });
};
