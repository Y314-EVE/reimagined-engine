import { Chatlist, ChatContent, TopBar } from "../components";

import { ChatProvider } from "../contexts";

const Chat = () => {
  return (
    <ChatProvider>
      <div className="h-screen pb-24">
        <TopBar mode="chat" />
        <div className="flex flex-row pt-4 h-full">
          <Chatlist />
          <ChatContent />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;
