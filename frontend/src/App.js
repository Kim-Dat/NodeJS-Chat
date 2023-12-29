import { Routes, Route } from "react-router-dom";
import "./App.css";
// import { Button, ButtonGroup } from "@chakra-ui/react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/chats" element={<Chat />}></Route>
            </Routes>
        </div>
    );
}

export default App;
