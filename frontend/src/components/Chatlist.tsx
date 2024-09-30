import { useEffect, useState } from "react";
import axios from "axios";

interface ChatlistItemProps {
  _id: string;
  title: string;
  createdAt: string;
}

const ChatlistItem = (chat: ChatlistItemProps) => {
  return (
    <div
      className={`flex flex-col flex-1 text-left px-4 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-200`}
    >
      <p className="text-base">{chat.title}</p>
      <p className="text-sm text-gray-400">{chat.createdAt}</p>
    </div>
  );
};

const Chatlist = () => {
  const [chatList, setChatList] = useState(Array<ChatlistItemProps>());
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
    <div>
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
