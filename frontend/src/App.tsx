import { Routes, Route, Navigate } from "react-router";
import "./App.css";

import { Login, Chat, ForgotPassword, ResetPassword } from "./containers";

function App() {
  const isLoggedIn = () => {
    return document.cookie.includes("refresh_token");
  };
  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn() ? <Navigate replace to="/chat" /> : <Login />}
      />
      <Route
        path="/chat"
        element={isLoggedIn() ? <Chat /> : <Navigate replace to="/" />}
      />
      <Route
        path="/forgot-password"
        element={
          isLoggedIn() ? <Navigate replace to="/chat" /> : <ForgotPassword />
        }
      />
      <Route
        path="/reset-password/:token/:email"
        element={
          isLoggedIn() ? <Navigate replace to="/chat" /> : <ResetPassword />
        }
      />
    </Routes>
  );
}

export default App;
