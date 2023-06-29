"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.auth = exports.register = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const register = async (req, res, next) => {
    const { name, lastname, email, password } = req.body;
    if (!name || !lastname || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
    if (!regex.test(email))
        res.status(422).json({ message: "Invlid email" });
    if (password.length < 6) {
        res
            .status(403)
            .json({ message: "Password must at least 6 characters long" });
    }
    const userExist = await userModel_1.default.findOne({ email });
    if (userExist) {
        return res.status(409).json({ message: "Email already in use" });
    }
    const user = await userModel_1.default.create({
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
    }
    else {
        return res.status(400).json({ message: "Invalid user data" });
        // TODO throw error
    }
};
exports.register = register;
const auth = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
    if (!regex.test(email))
        res.status(422).json({ message: "Invlid email" });
    const user = await userModel_1.default.findOne({ email });
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
    }
    else {
        return res.status(401).json({ message: "Invalid email or password" });
    }
};
exports.auth = auth;
const logout = async (req, res) => {
    // req.session.cookie = {
    //   httpOnly: true,
    //   expires: new Date(0),
    // };
    req.session.destroy((err) => {
        if (err)
            console.log("Logout Error: ", err);
    });
    res.status(200).json({ message: "User logged out" });
};
exports.logout = logout;
