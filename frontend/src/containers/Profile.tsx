import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenUpdate } from "../helpers";
import { FiEdit2, FiCheck, FiX, FiChevronLeft } from "react-icons/fi";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userInfoRequest = async () => {
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const userInfoResponse = await axios.post(
        "http://localhost:5000/api/auth/user-info",
        {},
        {
          headers: { Authorization: token },
        },
      );
      const { name, email } = userInfoResponse.data.payload;
      setUserInfo({ name, email });
    };
    userInfoRequest();
  }, []);

  const updateNameRequest = async (newName: string) => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
    const updateNameResponse = await axios.put(
      "http://localhost:5000/api/auth/update-name",
      { name: newName },
      {
        headers: { Authorization: token },
      },
    );
    if (updateNameResponse.status === 200) {
      setUserInfo({ name: newName, email: userInfo.email });
    }
  };

  const passwordChangeRequest = async (
    password: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    try {
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const passwordChangResponse = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          password: password,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        {
          headers: { Authorization: token },
        },
      );
      if (passwordChangResponse.data.code === 200) {
        setIsEditingPassword(false);
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <div className="flex flex-row items-center self-start p-4 cursor-pointer hover:text-gray-400">
        <FiChevronLeft className="mr-2" />
        <p onClick={() => navigate("/chat")}>Back to Chat</p>
      </div>
      <div className="flex flex-col p-12 my-auto border-2 border-gray rounded-lg mix-blend-difference">
        <div>
          <p className="p-2 text-gray-400 text-lg">Profile Settings</p>
          <p className="p-2 text-gray-400">Name</p>
          <div>
            {isEditingName ? (
              <div className="flex flex-row items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setIsEditingName(false);
                      updateNameRequest(name);
                    }
                    if (e.key === "Escape") {
                      setIsEditingName(false);
                    }
                  }}
                  className="border-2 border-gray-200 rounded p-2"
                />
                <FiCheck
                  className="ml-2 cursor-pointer"
                  onClick={() => {
                    setIsEditingName(false);
                    updateNameRequest(name);
                  }}
                />
                <FiX
                  className="ml-2 cursor-pointer"
                  onClick={() => {
                    setIsEditingName(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-row items-center">
                <p className="min-w-48 max-w-100 flex-1 p-2 text-black dark:text-white">
                  {userInfo.name}
                </p>
                <FiEdit2
                  className="ml-2 text-gray-400 cursor-pointer hover:text-gray-200"
                  onClick={() => {
                    setIsEditingName(true);
                    setName(userInfo.name);
                  }}
                />
              </div>
            )}
          </div>
          <p className="p-2 text-gray-400">Email</p>
          <div className="flex flex-row items-center">
            <p className="min-w-48 max-w-100 flex-1 p-2 text-black dark:text-white">
              {userInfo.email}
            </p>
          </div>
          {isEditingPassword ? (
            <div>
              <div className="flex flex-col">
                <p className="mt-4 p-2 text-gray-400 text-lg">Reset Password</p>
                <p className="p-2 text-gray-400">Current password</p>
                <div className="flex flex-row">
                  <input
                    type="password"
                    className="min-w-48 max-w-100 flex-1 border-2 rounded"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                  />
                </div>
                <p className="p-2 text-gray-400">New password</p>
                <div className="flex flex-row">
                  <input
                    type="password"
                    value={newPassword}
                    className="min-w-48 max-w-100 flex-1 border-2 rounded"
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                    }}
                  />
                </div>
                <p className="p-2 text-gray-400">Confirm password</p>
                <div className="flex flex-row">
                  <input
                    type="password"
                    value={confirmPassword}
                    className="min-w-48 max-w-100 flex-1 border-2 rounded"
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        passwordChangeRequest(
                          password,
                          newPassword,
                          confirmPassword,
                        );
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    passwordChangeRequest(
                      password,
                      newPassword,
                      confirmPassword,
                    );
                  }}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingPassword(false);
                    setPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-row mt-4">
              <button
                type="button"
                className="flex-1 mt-2 py-1 border-2 rounded border-gray-100 bg-sky-500 cursor-pointer text-center"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditingPassword(true);
                }}
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
