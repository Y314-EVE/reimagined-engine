import {
  ReactNode,
  useContext,
  useEffect,
  useState,
  createContext,
} from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { tokenUpdate } from "../helpers";

interface ChatContextType {
  socket: Socket | null;
  selectedChat: string | null;
  messages: MessageProps[];
  chatList: ChatlistItemProps[];
  setSelectedChat: (chat: string) => void;
  setMessages: (messages: MessageProps[]) => void;
  addMessage: (msg: MessageProps) => void;
  getChatList: () => void;
  setChatList: (chatList: ChatlistItemProps[]) => void;
}
interface ChatlistItemProps {
  _id: string;
  title: string;
  createdAt: string;
}
interface MessageProps {
  _id: string;
  chat: string;
  user: string;
  bot: boolean;
  content: string;
  context: [];
  createdAt: string;
  updatedAt: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = (props: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [chatList, setChatList] = useState<ChatlistItemProps[]>([]);
  const addMessage = (msg: MessageProps) => {
    setMessages((prev) => [...prev, msg]);
  };
  const getChatList = async () => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
    const getChatListResponse = await axios.get(
      "http://localhost:5003/api/chat/list-chats",
      {
        headers: {
          Authorization: token,
        },
      },
    );
    setChatList(getChatListResponse.data.data);
  };
  useEffect(() => {
    if (!socket) {
      setSocket(io("http://localhost:5003"));
    }
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on("receive message", addMessage);

    return () => {
      socket.off("receive message", addMessage);

      //   if (selectedChat) {
      //     socket.emit("leave chat", selectedChat);
      //   }
    };
  }, [selectedChat, socket]);
  return (
    <ChatContext.Provider
      value={{
        socket,
        selectedChat,
        messages,
        chatList,
        setSelectedChat,
        setMessages,
        addMessage,
        getChatList,
        setChatList,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatContext Provider");
  }
  return context;
};
