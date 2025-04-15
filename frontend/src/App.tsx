import { Routes, Route, Navigate } from "react-router";
import "./App.css";

import {
  Login,
  Chat,
  ForgotPassword,
  ResetPassword,
  Profile,
} from "./containers";

import {
  Calendar,
  TrackerDisplay
} from "./components";
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
      path="/calendar"
      element = {isLoggedIn()?<Calendar/> : <Navigate replace to = "/"/>}/>

<Route
      path="/exercise-tracker"
      element = {isLoggedIn()?<TrackerDisplay /> : <Navigate replace to = "/"/>}/>

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
      <Route
        path="/profile"
        element={isLoggedIn() ? <Profile /> : <Navigate replace to="/" />}
      />
    </Routes>
  );
}

export default App;
