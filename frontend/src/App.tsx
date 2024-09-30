import "./App.css";
import { Login, Chat } from "./containers";

function App() {
  return (
    <>
      <div>
        <Login />
        {document.cookie.includes("access_token") ? <Chat /> : ""}
      </div>
    </>
  );
}

export default App;
