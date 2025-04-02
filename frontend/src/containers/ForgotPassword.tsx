import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

const ForgotPassword = () => {
  const [userEmail, setUserEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();

  const resetRequest = async (email: string) => {
    try {
      const resetResponse = await axios.post(
        "http://localhost:5000/api/auth/send-reset-email",
        {
          email: email,
        },
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
            An email has been sent to the email address if it exists. Please
            check your inbox.
          </p>
        ) : (
          <>
            <p className="p-2 text-gray-400">Forgot Password</p>
            <p className="p-2 text-gray-400">Email</p>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  resetRequest(userEmail);
                }
              }}
              className="w-48 border-2 rounded flex flex-1"
            />
            <button
              type="button"
              className="mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                resetRequest(userEmail);
              }}
            >
              Send Request
            </button>
          </>
        )}
      </div>
      <p
        className="self-end p-4 underline text-blue-500 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Login instead
      </p>
    </div>
  );
};

export default ForgotPassword;
