import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Image } from "@chakra-ui/react";
import { Text, Button } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            {children ? <span onClick={onOpen}>{children}</span> : <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader fontSize="40px" display="flex" justifyContent="center">
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
                        <Image borderRadius="full" boxSize="150px" src={user.pic} alt={user.name} />
                        <Text fontSize={{ base: "26px", md: "20px" }}>Email: {user.email}</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Đóng</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;
