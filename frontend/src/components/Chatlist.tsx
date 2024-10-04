import { useEffect, useState } from "react";
import axios from "axios";

import { useChat } from "../contexts";

interface ChatlistItemProps {
  _id: string;
  title: string;
  createdAt: string;
}

const Chatlist = () => {
  const { token, setSelectedChat } = useChat();
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
    <div className="w-1/6 ">
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
export default Chatlist;
