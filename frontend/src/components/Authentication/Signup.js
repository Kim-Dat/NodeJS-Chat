import React, { useState } from "react";
import { VStack } from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
const Signup = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pic, setPic] = useState("");
    const [picLoading, setPicLoading] = useState(false);
    const toast = useToast();
    /* handle submit */
    const submitHandler = async () => {
        setPicLoading(true);
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Vui lòng điền đầy đủ thông tin!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setPicLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: "Mật khẩu không khớp!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const { data } = await axios.post("/api/auth/register", { name, email, password, pic }, config);

            if (data) {
                toast({
                    title: "Sign Up SuccessFully!",
                    description: "Welcome to DevAt chat",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
                setPicLoading(false);
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
            setPicLoading(false);
        }
    };

    /* post Details */
    const postDetails = (pics) => {
        setPicLoading(true);
        if (pics === undefined) {
            toast({
                title: "Vui lòng chọn một hình ảnh!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "piyushproj");
            fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setPicLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setPicLoading(false);
                });
        } else {
            toast({
                title: "Hình ảnh không phù hợp!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            setPicLoading(false);
            return;
        }
    };
    return (
        <VStack spacing="5px">
            <FormControl id="first-name" isRequired>
                <FormLabel>Tên</FormLabel>
                <Input placeholder="Enter Your Name" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Mật khẩu</FormLabel>
                <InputGroup size="md">
                    <Input type={show ? "text" : "password"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <InputGroup size="md">
                    <Input type={show ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="pic">
                <FormLabel>Cập nhật hình ảnh của bạn</FormLabel>
                <Input type="file" p={1.5} accept="image/*" onChange={(e) => postDetails(e.target.files[0])} />
            </FormControl>
            <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={picLoading}>
                Đăng ký
            </Button>
        </VStack>
    );
};

export default Signup;
