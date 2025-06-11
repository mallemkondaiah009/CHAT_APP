import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";


export const signup = async (req,res) => {
    const { email,fullName,password } = req.body;
    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = (req,res) => {
    res.send("login route");
};

export const logout = (req,res) => {
    res.send("logout route");
};