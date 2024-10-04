import { Chatlist, ChatContent } from "../components";

import { ChatProvider } from "../contexts";

const Chat = () => {
  return (
    <ChatProvider>
      <div className="flex flex-row h-5/6">
        <Chatlist />
        <ChatContent />
      </div>
    </ChatProvider>
  );
};

export default Chat;
