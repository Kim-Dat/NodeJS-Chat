const authRoute = require("./AuthRoute");
const userRoute = require("./UserRoute");
const chatRoute = require("./ChatRoute");
const messageRoute = require("./MessageRoute");
const routes = (app) => {
    app.use("/api/auth", authRoute);
    app.use("/api/user", userRoute);
    app.use("/api/chat", chatRoute);
    app.use("/api/message", messageRoute);
};

module.exports = routes;
