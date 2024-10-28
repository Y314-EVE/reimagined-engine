import "./App.css";

import { Login, Chat } from "./containers";

function App() {
  const hasToken = document.cookie.includes("access_token");
  return (
    <div
      className={`h-screen flex flex-col ${
        !hasToken ? "justify-center items-center" : ""
      }`}
    >
      {hasToken ? <Chat /> : <Login />}
    </div>
  );
}

export default App;
