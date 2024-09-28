import "./App.css";
import { Login } from "./containers";
import { Chatlist } from "./components";

function App() {
  return (
    <>
      <div>
        <Login />
        <Chatlist />
      </div>
    </>
  );
}

export default App;
