import axios from "axios";
import { useState } from "react";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginRequest = async (email: string, password: string) => {
    try {
      const loginResponse = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email,
          password: password,
        }
      );
      document.cookie = `access_token=${
        loginResponse.data.payload.token
      }; expires=${new Date(Date.now() + 30 * 864e5).toUTCString()}; path=/`;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-row flex-1 m-8">
      <p className="ml-4 mr-1 p-2">Email</p>
      <input
        type="email"
        value={userEmail}
        onChange={(event) => {
          setUserEmail(event.target.value);
        }}
        className="w-48 border-2 rounded"
      />
      <p className="ml-4 mr-1 p-2">Password</p>
      <input
        type="password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
        className="w-48 border-2 rounded"
      />
      <button
        type="button"
        className="mx-4 py-1 border-2 rounded border-gray-100 bg-sky-100 cursor-pointer"
        onClick={(e) => {
          e.preventDefault;
          loginRequest(userEmail, password);
        }}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
