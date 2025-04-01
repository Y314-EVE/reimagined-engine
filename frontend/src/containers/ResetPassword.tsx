import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

const ResetPassword = () => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const params = useParams();
  const { token, email } = params;
  if (!token || !email) {
    navigate("/");
  }

  const resetRequest = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      const resetResponse = await axios.put(
        "http://localhost:5000/api/auth/reset-password",
        {
          token: token,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }
      );
      if (resetResponse.data.code === 200) {
        setResetSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <div className="flex flex-col p-12 my-auto border-2 border-gray rounded-lg mix-blend-difference">
        {resetSuccess ? (
          <p className="p-2 text-gray-400">
            Your password has been reset successfully. You can now log in.
          </p>
        ) : (
          <div className="flex flex-col">
            <p className="p-2 text-gray-400">Reset Password</p>
            <p className="p-2 text-gray-400">Password</p>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resetRequest(email!, password, confirmPassword);
                }
              }}
              className="w-48 border-2 rounded"
            />
            <p className="p-2 text-gray-400">Confirm password</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  password === confirmPassword
                    ? resetRequest(email!, password, confirmPassword)
                    : alert("Passwords do not match");
                }
              }}
              className="w-48 border-2 rounded"
            />
            <button
              type="button"
              className="mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                password === confirmPassword
                  ? setResetSuccess(true)
                  : alert("Passwords do not match");
                resetRequest(email!, password, confirmPassword);
              }}
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
