import axios from "axios";
import { useEffect, useState } from "react";
import { Message } from "../components";

interface MessageProps {
  _id: string;
  user: string;
  bot: boolean;
  content: string;
  context: [];
  createdAt: string;
  updatedAt: string;
}
interface chatData {
  _id: string;
  user: string;
  title: string;
  messages: MessageProps[];
}

interface ChatProps {
  _id: string;
}

interface ChatlistItemProps {
  _id: string;
  title: string;
  createdAt: string;
}

const ChatContent = (props: ChatProps) => {
  const [chat, setChat] = useState<chatData>({
    _id: "",
    user: "",
    title: "",
    messages: [],
  });

  useEffect(() => {
    async function chatRequest() {
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const chatResponse = await axios.post(
        "http://localhost:5000/api/chat/get-chat",
        { _id: props._id },
        {
          headers: { Authorization: token },
        }
      );
      setChat(chatResponse.data.data);
    }
    chatRequest();
  }, [props._id]);
  return (
    <div className="w-5/6 p-8 pt-0 mx-2  ">
      <div className="w-full p-2 pl-4 rounded-t-xl bg-green-300">
        <p className="font-bold">{chat.title}</p>
      </div>
      <div className="p-1 px-3 border-b-2 border-x-2 rounded-b-xl border-gray-400 flex flex-col">
        {chat.messages.map((message: MessageProps) => (
          <Message
            key={message._id + message.createdAt}
            isBot={message.bot}
            content={message.content}
            createdAt={message.createdAt}
          />
        ))}
      </div>
    </div>
  );
};

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState("");

  const Chatlist = () => {
    const [chatList, setChatList] = useState(Array<ChatlistItemProps>());

    const ChatlistItem = (chat: ChatlistItemProps) => {
      return (
        <div
          className={`text-left px-4 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-200`}
          onClick={() => {
            setSelectedChat(chat._id);
          }}
        >
          <p className="text-base">{chat.title}</p>
          <p className="text-sm text-gray-400">{chat.createdAt}</p>
        </div>
      );
    };

    useEffect(() => {
      async function chatListRequest() {
        const token = document.cookie.split("; ").reduce((prev, curr) => {
          const parts = curr.split("=");
          return parts[0] === "access_token" ? parts[1] : prev;
        }, "");

        const chatListResponse = await axios.get(
          "http://localhost:5000/api/chat/list-chats",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setChatList(chatListResponse.data.data);

        //   console.log(
        //     document.cookie.split("; ").reduce((prev, curr) => {
        //       const parts = curr.split("=");
        //       return parts[0] === "access_token" ? parts[1] : prev;
        //     }, "")
        //   );
      }
      chatListRequest();
    }, []);
    return (
      <div className="w-1/6">
        {chatList.map((chat) => (
          <ChatlistItem
            _id={chat._id}
            title={chat.title}
            createdAt={chat.createdAt}
            key={chat._id + chat.title}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="flex flex-1 flex-row">
      <Chatlist />
      <ChatContent _id={selectedChat} />
    </div>
  );
};

export default Chat;
