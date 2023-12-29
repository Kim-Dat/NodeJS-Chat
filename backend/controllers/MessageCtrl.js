const Chat = require("../model/Chat");
const Message = require("../model/Message");
const User = require("../model/User");
class MessageController {
    async sendMessage(req, res) {
        const { content, chatId } = req.body;
        if (!content || !chatId) {
            console.log("Invalid data passed into request");
            return res.sendStatus(400);
        }
        try {
            /* tạo mới message */
            let newMessage = await Message.create({
                sender: req.user._id,
                content: content,
                chat: chatId,
            });
            /* lấy ảnh của sender */
            newMessage = await newMessage.populate("sender", "pic");
            /* lấy ra chat */
            newMessage = await newMessage.populate("chat");
            /* lấy ra thông tin user từ chat.users và chỉ lấy name, pic , email, từ trong newMessage */
            newMessage = await User.populate(newMessage, {
                path: "chat.users",
                select: "name pic email",
            });
            /* cập nhât tin nhắn mới nhất */
            await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: newMessage });
            res.json(newMessage);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

    async allMessage(req, res) {
        try {
            const messages = await Message.find({ chat: req.params.chatId }).populate("sender", "name pic email").populate("chat");
            res.json(messages);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
}

module.exports = new MessageController();
