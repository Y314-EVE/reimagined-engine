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

interface MessageCreateResponse {
  code: string;
  message: string;
  payload: {
    user: string;
    bot: boolean;
    content: string;
    context: [];
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
  respond: string;
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState("");
  const [messagUpdate, setMessageUpdate] = useState(0);
  const token = document.cookie.split("; ").reduce((prev, curr) => {
    const parts = curr.split("=");
    return parts[0] === "access_token" ? parts[1] : prev;
  }, "");

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

  const InputBox = () => {
    const [messageInput, setMessageInput] = useState("");
    async function createMessage() {
      if (messageInput.trim() === "") {
        return;
      }
      const createMessageResponse = await axios.post(
        "http://localhost:5000/api/message/create",
        { chat: selectedChat, content: messageInput },
        { headers: { Authorization: token } }
      );
      setMessageInput("");

      const getResponse: MessageCreateResponse = createMessageResponse.data;
      await axios
        .put(
          "http://localhost:5000/api/message/get-response",
          {
            prompt: getResponse.payload._id,
            respond: getResponse.respond,
          },
          { headers: { Authorization: token } }
        )
        .then(() => {
          setMessageUpdate(messagUpdate + 1);
        });
    }
    return (
      <div className="px-4">
        <div className="border-2 border-gray-500 rounded-md mb-2 p-2 flex flex-col">
          <textarea
            className="border-none flex-1 overflow-y-scroll resize-none"
            rows={3}
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
                createMessage();
              }
            }}
          />
          <div className="py-1" />
          <button
            type="button"
            className="rounded-full bg-sky-700 text-white font-semibold text-xs self-end"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.currentTarget.value);
            }}
            onClick={(e) => {
              e.preventDefault;
              createMessage();
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  const ChatContent = (props: ChatProps) => {
    const [chat, setChat] = useState<chatData>({
      _id: "",
      user: "",
      title: "",
      messages: [],
    });

    useEffect(() => {
      async function chatRequest() {
        const chatResponse = await axios.post(
          "http://localhost:5000/api/chat/get-chat",
          { _id: props._id },
          {
            headers: { Authorization: token },
          }
        );
        setChat(chatResponse.data.data);
      }
      props._id === "" ? "" : chatRequest();
    }, [props._id, messagUpdate]);
    return (
      <div className="w-5/6 h-full px-4 pb-4 mx-2 ">
        <div className="w-full p-2 pl-4 rounded-t-xl bg-green-300">
          <p className="font-bold">{chat.title}</p>
        </div>
        <div className="flex flex-col border-b-2 border-x-2 rounded-b-xl border-gray-400 h-full">
          <div className="flex flex-col overflow-y-auto h-full">
            {chat.messages.map((message: MessageProps) => (
              <Message
                key={message._id + message.createdAt}
                isBot={message.bot}
                content={message.content}
                createdAt={message.createdAt}
              />
            ))}
          </div>
          <InputBox />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-5/6">
      <Chatlist />
      <ChatContent _id={selectedChat} />
    </div>
  );
};

export default Chat;
