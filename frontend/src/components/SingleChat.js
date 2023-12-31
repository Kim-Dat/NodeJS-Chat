import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import "./style.css";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`api/message/${selectedChat._id}`, config);

            if (data) {
                setMessages(data);
                setLoading(false);
                socket.emit("join chat", selectedChat._id);
            }
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Load the Message",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const { data } = await axios.post("api/message", { content: newMessage, chatId: selectedChat._id }, config);

                if (data) {
                    socket.emit("new message", data);
                    setNewMessage("");
                    setMessages([...messages, data]);
                }
            } catch (error) {
                toast({
                    title: "Error Occurred!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom-left",
                });
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            /* nếu cuộc trò chuyện không được chọn hoặc không khớp với cuộc trò chuyện hiện tại */
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                /* give notification */
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        });
    });

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        /* delay thời gian typing */
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text fontSize={{ base: "28px", md: "30px" }} pb={3} px={2} w="100%" display="flex" justifyContent={{ base: "space-between" }} alignItems="center">
                        <IconButton display={{ base: "flex", md: "none" }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat("")} />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} children={false} />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                            </>
                        )}
                    </Text>
                    <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} bg="#E8E8E8" w="100%" h="100%" borderRadius="lg" overflowY="hidden">
                        {loading ? (
                            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
                            {isTyping ? (
                                <div>
                                    <Lottie options={defaultOptions} width={70} style={{ marginBottom: 15, marginLeft: 0 }} />
                                </div>
                            ) : (
                                <></>
                            )}
                            <Input variant="filled" bg="#FFFFFF" placeholder="Enter a message.." value={newMessage} onChange={typingHandler} />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3}>
                        Nhấp vào người dùng để bắt đầu trò chuyện...
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;
