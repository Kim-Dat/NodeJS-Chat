const User = require("../model/User");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
class UserController {
    /* [POST] */
    async register(req, res) {
        /* check thông tin */
        const { name, email, password, pic } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please Enter all the Fields");
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error("User already exists");
        }

        /* tạo mới người dùng */
        const user = await User.create({
            name,
            email,
            password,
            pic,
        });
        /* kiểm tra người dùng mới được tạo */
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error("User not found");
        }
    }
    async login(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error("Invalid Email or Password");
        }
    }

    async loginFailed(req, res) {
        res.status(401).json({
            success: false,
            message: "failure",
        });
    }
}

module.exports = new UserController();
