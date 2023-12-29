require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 6000;
const { dbConnect } = require("./config/db");
const routes = require("./routes");
const expressSession = require("express-session");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET, POST, PUT, PATCH, DELETE"],
        credentials: true,
    })
);

/* connect Database */
dbConnect();
/* routes */
routes(app);

/* ------------deployment----------------- */
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/frontend/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running..");
    });
}
/* ------------deployment----------------- */

/* handle error */
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running on PORT:  http://localhost:${PORT}`);
});
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined Room", room);
    });

    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chat.users not defined");
        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
