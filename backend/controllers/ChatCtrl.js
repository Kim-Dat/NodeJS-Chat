const Chat = require("../model/Chat");
const User = require("../model/User");
class ChatController {
    async createGroupChat(req, res) {
        console("success");
    }
    async rename(req, res) {
        console("success");
    }
    async accessChat(req, res) {
        const { userId } = req.body;
        if (!userId) {
            console.log("UserId not found");
            return res.status(400);
        }
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
        })
            .populate("users")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };
            try {
                const createdChat = await Chat.create(chatData);
                const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users");
                res.status(200).json(fullChat);
            } catch (error) {
                throw new Error(error);
            }
        }
    }
    async fetChats(req, res) {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate("users")
                .populate("groupAdmin")
                .populate("latestMessage")
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: "latestMessage.sender",
                        select: "name pic email",
                    });
                    res.status(200).json(results);
                });
        } catch (error) {
            throw new Error(error);
        }
    }
    async createGroupChat(req, res) {
        /* nhập tên nhóm và thành viên */
        const { users, name } = req.body;
        if (!users || !name) {
            return res.status(400).send({ message: "Please Fill all the feilds" });
        }
        let usersParse = JSON.parse(users);
        /* bắt buộc phải có 2 người mới tạo thành group */
        if (usersParse.length < 2) {
            return res.status(400).send("More than 2 users are required to form a group chat");
        }
        usersParse.push(req.user);
        try {
            const groupChat = await Chat.create({
                chatName: name,
                users: usersParse,
                isGroupChat: true,
                groupAdmin: req.user,
            });
            const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate("users").populate("groupAdmin");

            res.status(200).json(fullGroupChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
    async renameGroup(req, res) {
        const { chatId, newNameChat } = req.body;
        const updateChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: newNameChat,
            },
            {
                new: true,
            }
        )
            .populate("users")
            .populate("groupAdmin");
        if (!updateChat) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.status(200).json(updateChat);
        }
    }
    async addToGroup(req, res) {
        const { chatId, userId } = req.body;
        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: {
                    users: userId,
                },
            },
            {
                new: true,
            }
        )
            .populate("users")
            .populate("groupAdmin");
        if (!added) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.status(200).json(added);
        }
    }
    async removeFromGroup(req, res) {
        const { chatId, userId } = req.body;
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: {
                    users: userId,
                },
            },
            {
                new: true,
            }
        )
            .populate("users")
            .populate("groupAdmin");
        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.status(200).json(removed);
        }
    }
}

module.exports = new ChatController();
