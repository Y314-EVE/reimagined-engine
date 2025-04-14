import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUp, setSignUp] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [loginFailedMessage, setLoginFailedMessage] = useState("");
  const [registerFailed, setRegisterFailed] = useState(false);
  const [registerFailedMessage, setRegisterFailedMessage] = useState("");

  const navigate = useNavigate();

  const loginRequest = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      setLoginFailed(true);
      setLoginFailedMessage("Email and password are required");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      setLoginFailed(true);
      setLoginFailedMessage("Invalid email");
      return;
    }
    try {
      const loginResponse = await axios.post(
        "http://localhost:5003/api/auth/login",
        {
          email: email.trim(),
          password: password,
        },
      );
      if (loginResponse.data.code === 200) {
        document.cookie = `access_token=${
          loginResponse.data.payload.accessToken
        }; SameSite=Strict; expires=${new Date(
          Date.now() + 15 * 60e3,
        ).toUTCString()}; path=/`;
        document.cookie = `refresh_token=${
          loginResponse.data.payload.refreshToken
        }; SameSite=Strict; expires=${new Date(
          Date.now() + 30 * 864e5,
        ).toUTCString()}; path=/`;
        window.location.reload();
      }
    } catch (error) {
      setLoginFailed(true);
      // console.error(error);
      if (error instanceof AxiosError) {
        setLoginFailedMessage(error.response?.data.message);
      }
    }
  };

  const registerRequest = async (
    name: string,
    email: string,
    password: string,
    confirm_password: string,
  ) => {
    if (!email.trim() || !password || !name.trim()) {
      setRegisterFailed(true);
      setRegisterFailedMessage("Email, name, and password are required");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      setRegisterFailed(true);
      setRegisterFailedMessage("Invalid email");
      return;
    }
    if (password.length < 8) {
      setRegisterFailed(true);
      setRegisterFailedMessage("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm_password) {
      setRegisterFailed(true);
      setRegisterFailedMessage("Passwords do not match");
      return;
    }
    try {
      const registerResponse = await axios.post(
        "http://localhost:5003/api/auth/register",
        {
          name: name,
          email: email,
          password: password,
          confirm_password: confirm_password,
        },
      );
      if (registerResponse.data.code === 201) {
        alert("A verification email has been sent to your email address.");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <div className="flex flex-col p-12 my-auto border-2 border-gray rounded-lg mix-blend-difference">
        {signUp ? (
          <div className="flex flex-col">
            <p className="p-2 text-gray-400">Name</p>
            <input
              type="input"
              value={userName}
              onChange={(event) => {
                setUserName(event.target.value);
              }}
              className="w-full border-2 rounded"
            />
          </div>
        ) : (
          ""
        )}

        <p className="p-2 text-gray-400">Email</p>
        <input
          type="email"
          value={userEmail}
          onChange={(event) => {
            setUserEmail(event.target.value);
          }}
          className="w-full border-2 rounded"
        />

        <p className="p-2 text-gray-400">Password</p>
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
          className="w-full border-2 rounded"
        />

        {!signUp && loginFailed ? (
          <p className="flex text-red-600 p-1">{loginFailedMessage}</p>
        ) : (
          ""
        )}

        {signUp ? (
          <div className="flex flex-col">
            <p className="p-2 text-gray-400">Confirm password</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && signUp) {
                  e.preventDefault();
                  registerRequest(
                    userName,
                    userEmail,
                    password,
                    confirmPassword,
                  );
                }
              }}
              className="w-full border-2 rounded"
            />
          </div>
        ) : (
          ""
        )}

        {signUp && registerFailed ? (
          <p className="flex text-red-600 p-1">{registerFailedMessage}</p>
        ) : (
          ""
        )}

        <button
          type="button"
          className="mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer"
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

        <p className="self-center mt-2">or</p>

        <p
          className="self-center underline text-blue-500 cursor-pointer"
          onClick={() => {
            setSignUp((prev) => !prev);
            setUserName("");
            setUserEmail("");
            setPassword("");
            setConfirmPassword("");
            setLoginFailed(false);
            setLoginFailedMessage("");
            setRegisterFailed(false);
            setRegisterFailedMessage("");
          }}
        >
          {!signUp ? "Sign up" : "Login"}
        </p>
      </div>
      <p
        className="self-end p-4 underline text-blue-500 cursor-pointer"
        onClick={() => navigate("/forgot-password")}
      >
        Forgot password?
      </p>
    </div>
  );
};

export default Login;
