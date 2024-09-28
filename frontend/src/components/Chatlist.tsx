import { useEffect, useState } from "react";
import axios from "axios";

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
}

const Chatlist = () => {
  const [chatList, setChatList] = useState(Array<Chat>());
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
        <p key={chat._id}>{`${chat.title} (${chat.createdAt})`}</p>
      ))}
    </div>
  );
};

export default Chatlist;
