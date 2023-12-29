import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, Box, ModalFooter, ModalBody, ModalCloseButton, IconButton, Button, useDisclosure, useToast, FormControl, Input, Spinner } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [renameLoading, setRenameLoading] = useState(false);
    const { selectedChat, setSelectedChat, user } = ChatState();

    const toast = useToast();

    const handleRemove = async (userToRemove) => {
        console.log(userToRemove);
        /* Nếu không phải admin thì không đc xóa thành viên và người hiện tại phải khác với người bị xóa */
        if (selectedChat.groupAdmin._id !== user._id && user._id === userToRemove._id) {
            toast({
                title: "Chỉ quản trị viên mới có thể xóa ai đó!",
                status: "error",
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
            const { data } = await axios.put(
                `/api/chat/group-remove`,
                {
                    chatId: selectedChat._id,
                    userId: userToRemove._id,
                },
                config
            );

            userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
            setGroupChatName("");
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                description: error.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setLoading(false);
        }
    };
    const handleRename = async () => {
        if (!groupChatName) return;
        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put("api/chat/rename", { chatId: selectedChat._id, newNameChat: groupChatName }, config);
            if (data) {
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
                setRenameLoading(false);
                setGroupChatName("");
            }
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                description: error.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setRenameLoading(false);
        }
    };
    const handleSearch = async (query) => {
        if (!query) return;
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`api/user/?search=${query}`, config);
            if (data) {
                setLoading(false);
                setSearchResult(data);
            }
        } catch (error) {
            toast({
                title: "Không thể tạo cuộc trò chuyện!",
                description: error.response.data,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        }
    };

    const handleAddUser = async (userToAdd) => {
        if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
            toast({
                title: "Người dùng Đã có trong nhóm!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Chỉ quản trị viên mới có thể thêm ai đó!",
                status: "error",
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
            const { data } = await axios.put("api/chat/group-add", { chatId: selectedChat._id, userId: userToAdd._id }, config);
            if (data) {
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
                setLoading(false);
            }
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                description: error.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setLoading(false);
        }
    };
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader display={"flex"} justifyContent={"center"} fontSize={"35px"}>
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameLoading} onClick={handleRename}>
                                Cập nhật
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add User to group" mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        {loading ? <Spinner size="lg" /> : searchResult?.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />)}
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Rời khỏi nhóm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;
