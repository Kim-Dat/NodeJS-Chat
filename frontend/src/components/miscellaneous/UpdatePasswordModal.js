import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, InputRightElement, InputGroup, useDisclosure, FormLabel, Button, FormControl, Input, useToast } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import axios from "axios";
const UpdatePasswordModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const toast = useToast();
    const handleChangePassword = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.patch("api/user/update-password", { oldPassword: oldPassword, newPassword: newPassword, userId: user._id }, config);
            if (data) {
                toast({
                    title: "Thay đổi mật khẩu thành công",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right",
                });
                onClose();
            }
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: error.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        }
    };
    return (
        <>
            {children ? <span onClick={onOpen}>{children}</span> : <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader fontSize="40px" display="flex" justifyContent="center">
                        Thay đổi mật khẩu
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
                        <FormControl>
                            <FormLabel>Mật khẩu cũ</FormLabel>
                            <InputGroup size="md">
                                <Input type={show ? "text" : "password"} placeholder="Nhập mật khẩu cũ tại đây..." mb={5} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                <InputRightElement width="4.5rem">
                                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                                        {show ? "Hide" : "Show"}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <InputGroup size="md">
                                <Input type={show ? "text" : "password"} placeholder="Nhập mật khẩu mới tại đây..." value={newPassword} mb={1} onChange={(e) => setNewPassword(e.target.value)} />
                                <InputRightElement width="4.5rem">
                                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                                        {show ? "Hide" : "Show"}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Button variant="solid" colorScheme="teal" ml={1} onClick={handleChangePassword}>
                            Cập nhật
                        </Button>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Đóng</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdatePasswordModal;
