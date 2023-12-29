import React, { useState } from "react";
import { Stack, HStack, VStack, Box } from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";
import { useNavigate } from "react-router-dom";
export const Login = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = ChatState();
    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Vui lòng điền đầy đủ thông tin",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post("/api/auth/login", { email, password }, config);

            if (data) {
                toast({
                    title: "Đăng nhập thành công",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
                setLoading(false);
                setUser(data);
                localStorage.setItem("userInfo", JSON.stringify(data));
                navigate("/chats");
            }
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
            setLoading(false);
        }
    };
    return (
        <VStack spacing="10px">
            <FormControl id="emaill" isRequired>
                <FormLabel>Email</FormLabel>
                <Input value={email} type="email" placeholder="Enter Your Email Address" onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="passwordl" isRequired>
                <FormLabel>Mật khẩu</FormLabel>
                <InputGroup size="md">
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="Enter password" />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
                Đăng nhập
            </Button>
        </VStack>
    );
};
