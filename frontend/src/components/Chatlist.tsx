import { useEffect } from "react";
import axios from "axios";
import { FiPlus } from "react-icons/fi";

import { useChat } from "../contexts";
import { tokenUpdate } from "../helpers";

interface ChatlistItemProps {
  _id: string;
  title: string;
  createdAt: string;
}

const Chatlist = () => {
  const { setSelectedChat, chatList, getChatList, setChatList } = useChat();
  // const [chatList, setChatList] = useState(Array<ChatlistItemProps>());

  const createChatRequest = async () => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
    const createChatResponse = await axios.post(
      "http://localhost:5000/api/chat/create",
      {},
      { headers: { Authorization: token } }
    );
    if (createChatResponse.data.code === 201) {
      setSelectedChat(createChatResponse.data.payload._id);
      const chatListResponse = await axios.get(
        "http://localhost:5000/api/chat/list-chats",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setChatList(chatListResponse.data.data);
    }
  };

  const ChatlistItem = (chat: ChatlistItemProps) => {
    const localtime = new Date(chat.createdAt).toLocaleString();
    return (
      <div
        className={`text-left px-4 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-200`}
        onClick={() => {
          setSelectedChat(chat._id);
        }}
      >
        <p className="text-base mix-blend-difference">{chat.title}</p>
        <p className="text-sm text-gray-400">{localtime}</p>
      </div>
    );
  };

  useEffect(() => {
    // const chatListRequest = async () => {
    //   const chatListResponse = await axios.get(
    //     "http://localhost:5000/api/chat/list-chats",
    //     {
    //       headers: {
    //         Authorization: token,
    //       },
    //     },
    //   );
    //   setChatList(chatListResponse.data.data);

    //   //   console.log(
    //   //     document.cookie.split("; ").reduce((prev, curr) => {
    //   //       const parts = curr.split("=");
    //   //       return parts[0] === "access_token" ? parts[1] : prev;
    //   //     }, "")
    //   //   );
    // };
    // chatListRequest();
    getChatList();
  }, []);

  return (
    <div className="sm:-w-2/6 md:w-1/6 flex flex-col px-4 h-full overflow-scroll">
      <button
        className="bg-green-200 text-gray-600 mb-2"
        onClick={() => {
          createChatRequest();
        }}
      >
        <div className="flex flex-row justify-center place-items-center">
          <FiPlus className="mr-2" />
          <p>New Chat</p>
        </div>
      </button>
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
