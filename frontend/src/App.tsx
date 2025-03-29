import "./App.css";

import { Login, Chat } from "./containers";

function App() {
  // Todo
  // Add authentication logic
  const hasToken = document.cookie.includes("refresh_token");
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
