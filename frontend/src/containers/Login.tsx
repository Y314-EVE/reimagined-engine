import axios from "axios";
import { useState } from "react";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUp, setSignUp] = useState(false);

  const loginRequest = async (email: string, password: string) => {
    try {
      const loginResponse = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email,
          password: password,
        }
      );
      if (loginResponse.data.code === 200) {
        document.cookie = `access_token=${
          loginResponse.data.payload.token
        }; SameSite=Strict; expires=${new Date(
          Date.now() + 30 * 864e5
        ).toUTCString()}; path=/`;
        window.location.reload();
      } else if (loginResponse.data.code === 401) {
        alert("Incorrect email/password, please try again");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const registerRequest = async (
    name: string,
    email: string,
    password: string,
    confirm_password: string
  ) => {
    try {
      const registerResponse = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: name,
          email: email,
          password: password,
          confirm_password: confirm_password,
        }
      );
      if (registerResponse.data.code === 201) {
        alert("Sucessfully registered.");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-row py-6">
      {signUp ? (
        <div className="flex flex-row">
          <p className="ml-4 mr-1 p-2">Name</p>
          <input
            type="input"
            value={userName}
            onChange={(event) => {
              setUserName(event.target.value);
            }}
            className="w-48 border-2 rounded"
          />
        </div>
      ) : (
        ""
      )}

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
        onKeyDown={(e) => {
          if (e.key === "Enter" && !signUp) {
            e.preventDefault();
            loginRequest(userEmail, password);
          }
        }}
        className="w-48 border-2 rounded"
      />

      {signUp ? (
        <div className="flex flex-row">
          <p className="ml-4 mr-1 p-2">Confirm password</p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && signUp) {
                e.preventDefault();
                registerRequest(userName, userEmail, password, confirmPassword);
              }
            }}
            className="w-48 border-2 rounded"
          />
        </div>
      ) : (
        ""
      )}

      <button
        type="button"
        className="mx-4 py-1 border-2 rounded border-gray-100 bg-sky-100 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          if (signUp) {
            registerRequest(userName, userEmail, password, confirmPassword);
          } else {
            loginRequest(userEmail, password);
          }
        }}
      >
        {signUp ? "Sign up" : "Login"}
      </button>

      <p className="mx-2 self-end">or</p>

      <p
        className="self-end underline text-blue-500 cursor-pointer"
        onClick={() => setSignUp((prev) => !prev)}
      >
        {!signUp ? "Sign up" : "Login"}
      </p>
    </div>
  );
};

export default Login;
