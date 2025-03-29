import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useChat } from "../contexts";
import { Message } from "../components";
import { FiEdit2, FiDelete, FiCheck, FiX } from "react-icons/fi";
import { tokenUpdate } from "../helpers";

interface chatData {
  _id: string;
  user: string;
  title: string;
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

const ChatContent = () => {
  const [chat, setChat] = useState<chatData>({
    _id: "",
    user: "",
    title: "",
  });
  const [waitingRespond, setWaitingRespond] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    socket,
    messages,
    setMessages,
    addMessage,
    selectedChat,
    setSelectedChat,
    getChatList,
  } = useChat();

  useEffect(() => {
    if (!selectedChat) return;

    const chatRequest = async () => {
      // test update token
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const chatResponse = await axios.post(
        "http://localhost:5000/api/chat/get-chat",
        { _id: selectedChat },
        {
          headers: { Authorization: token },
        }
      );

      setChat({
        _id: chatResponse.data.data._id,
        user: chatResponse.data.data.user,
        title: chatResponse.data.data.title,
      });
      chatResponse.data.data.messages.map((message: MessageProps) => {
        addMessage(message);
      });
    };
    chatRequest();
    socket?.on("receive message", () => setWaitingRespond(false));
    return () => {
      socket?.off("connected chat");
      socket?.emit("leave chat", selectedChat);
      setMessages([]);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, waitingRespond]);

  const InputBox = () => {
    const [messageInput, setMessageInput] = useState("");
    async function createMessage() {
      if (messageInput.trim() === "") {
        return;
      }
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const createMessageResponse = await axios.post(
        "http://localhost:5000/api/message/create",
        { chat: selectedChat, content: messageInput },
        { headers: { Authorization: token } }
      );
      setMessageInput("");
      setWaitingRespond(true);

      const getResponse: MessageCreateResponse = createMessageResponse.data;
      await axios.put(
        "http://localhost:5000/api/message/get-response",
        {
          chat: selectedChat,
          prompt: getResponse.payload._id,
          respond: getResponse.respond,
        },
        { headers: { Authorization: token } }
      );
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
                // e.currentTarget.blur();
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
              e.preventDefault();
              createMessage();
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };
  const ChatTitle = ({ title }: { title: string }) => {
    const [isEditTitle, setIsEditTitle] = useState(false);
    const [chatTitle, setChatTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    });
    const handleSaveTitle = async () => {
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      // const changeTitleResponse =
      await axios.put(
        "http://localhost:5000/api/chat/change-title",
        { _id: chat._id, title: chatTitle },
        { headers: { Authorization: token } }
      );
      getChatList();
      const chatResponse = await axios.post(
        "http://localhost:5000/api/chat/get-chat",
        { _id: selectedChat },
        {
          headers: { Authorization: token },
        }
      );

      setChat({
        _id: chatResponse.data.data._id,
        user: chatResponse.data.data.user,
        title: chatResponse.data.data.title,
      });
    };
    const handleDeleteChat = async () => {
      if (confirm("Are you sure to delete the chat?")) {
        await tokenUpdate();
        const token = document.cookie.split("; ").reduce((prev, curr) => {
          const parts = curr.split("=");
          return parts[0] === "access_token" ? parts[1] : prev;
        }, "");
        // const deleteChatResponse =
        await axios.put(
          "http://localhost:5000/api/chat/delete",
          { _id: chat._id },
          { headers: { Authorization: token } }
        );
        setSelectedChat("");
        getChatList();
      }
    };

    return (
      <div className="w-full p-2 pl-4 rounded-t-xl bg-green-400">
        <div className="">
          {isEditTitle ? (
            <div className="flex flex-row flex-1 items-center justify-around">
              <input
                className="font-bold flex-grow ml-2"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveTitle();
                  }
                }}
                ref={inputRef}
              />
              <FiCheck
                className="cursor-pointer mx-2"
                onClick={() => handleSaveTitle()}
              />
              <FiX
                className="cursor-pointer mr-4"
                onClick={() => setIsEditTitle(false)}
              />
            </div>
          ) : (
            <div className="flex flex-row flex-1 items-center justify-around">
              <p className="font-bold flex-grow ml-2">{chat.title}</p>
              <FiEdit2
                className="cursor-pointer mr-2"
                onClick={() => {
                  setIsEditTitle(true);
                }}
              />
              <FiDelete
                className="cursor-pointer mr-4"
                onClick={() => {
                  handleDeleteChat();
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="w-5/6 h-full">
      {selectedChat ? (
        <div className="h-full px-4 pb-4 mx-2">
          <ChatTitle title={chat.title} />
          <div className="flex flex-col border-b-2 border-x-2 rounded-b-xl border-gray-400 h-full">
            <div
              className="flex flex-col overflow-y-auto h-full"
              ref={messagesContainerRef}
            >
              {messages.map((message: MessageProps) => (
                <Message
                  key={message._id}
                  isBot={message.bot}
                  content={message.content}
                  createdAt={message.createdAt}
                />
              ))}

              {waitingRespond ? (
                <div className="self-start my-2 mx-4 bg-blue-600 text-white w-auto max-w-5xl py-4 px-4 border-2 border-sky-400 rounded-lg flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-300 animate-pulse [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-blue-300 animate-pulse [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-blue-300 animate-pulse" />
                </div>
              ) : (
                ""
              )}
            </div>
            <InputBox />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ChatContent;
