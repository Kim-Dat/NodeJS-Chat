const User = require("../model/User");
class UserController {
    async allUsers(req, res) {
        try {
            const keyword = req.query.search
                ? {
                      $or: [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }],
                  }
                : {};

            const users = await User.find(keyword);

            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async updatePassword(req, res) {
        const { oldPassword, newPassword, userId } = req.body;
        try {
            let user = await User.findById({ _id: userId });
            if (oldPassword !== user.password && !newPassword) {
                res.status(400).json({ message: "The old password is incorrect. Please try again." });
            } else {
                user.password = newPassword;
                const newPass = await user.save();
                res.json(newPass);
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = new UserController();
