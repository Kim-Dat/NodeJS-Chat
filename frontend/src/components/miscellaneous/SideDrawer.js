import React, { useState } from "react";
import { Box, Tooltip, Button, Text, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Drawer, DrawerBody, DrawerFooter, Spinner, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Input, useToast } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import axios from "axios";
import { getSender } from "../../config/ChatLogics";
import UpdatePasswordModal from "./UpdatePasswordModal";
const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const toast = useToast();
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        localStorage.clear();
        window.location.reload();
        navigate("/");
    };
    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Vui lòng nhập nội dung nào đó vào tìm kiếm",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user/?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                description: "Không tải được kết quả tìm kiếm",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post("api/chat", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
        }
    };
    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
                <Tooltip label={"Search User to Chat"} hasArrow placement="bottom-end">
                    <Button variant="ghost" ref={btnRef} colorScheme="teal" onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text display={{ base: "none", md: "flex" }} px={4}>
                            Tìm kiếm người dùng...
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl">CHAT-DevAT</Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notification.length} effect={Effect.SCALE} />
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList px={3}>
                            {!notification.length && "Không có tin nhắn mới"}
                            {notification.map((n) => (
                                <MenuItem
                                    key={n._id}
                                    onClick={() => {
                                        setSelectedChat(n.chat);
                                        setNotification(notification.filter((ntf) => ntf !== n));
                                    }}
                                >
                                    {n.chat.isGroupChat ? `Tin nhắn mới trong ${n.chat.chatName}` : `Tin nhắn mới từ ${getSender(user, n.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>Hồ sơ của tôi</MenuItem>
                            </ProfileModal>
                            <UpdatePasswordModal user={user}>
                                <MenuItem>Đổi mật khẩu</MenuItem>
                            </UpdatePasswordModal>
                            <MenuDivider></MenuDivider>
                            <MenuItem onClick={logoutHandler}>Đăng xuất</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? <ChatLoading /> : searchResult.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)}></UserListItem>)}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default SideDrawer;
