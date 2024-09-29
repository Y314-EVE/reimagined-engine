import "./App.css";
import { Login } from "./containers";
import { Chatlist } from "./components";

function App() {
  return (
    <>
      <div>
        <Login />
        {document.cookie.includes("access_token") ? <Chatlist /> : ""}
      </div>
    </>
  );
}

export default App;
