import axios from "axios";
import { tokenUpdate } from "../helpers";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

interface TopBarProps {
  mode: string;
}

const TopBar = (props: TopBarProps) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfoRequest = async () => {
      await tokenUpdate();
      const token = document.cookie.split("; ").reduce((prev, curr) => {
        const parts = curr.split("=");
        return parts[0] === "access_token" ? parts[1] : prev;
      }, "");
      const userInfoResponse = await axios.post(
        "http://localhost:5003/api/auth/user-info",
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="flex flex-row justify-end border-b-2 shadow">
      <div className="flex flex-col flex-1">
        <div className="flex flex-row mt-1">
          <div
            className={`select-none px-4 pt-2 mx-4 rounded-t-lg ${props.mode == "schedule" ? "hover:bg-green-200 cursor-pointer text-black dark:text-white dark:hover:text-black" : "text-black bg-green-400"}`}
            onClick={() => {
              if (props.mode == "schedule") {
                navigate("/chat");
              }
            }}
          >
            <p>Chat</p>
          </div>
          <div
            className={`select-none px-4 pt-2 mx-4 rounded-t-lg ${props.mode == "chat" ? "hover:bg-green-200 cursor-pointer text-black dark:text-white dark:hover:text-black" : "text-black bg-green-400"}`}
            onClick={() => {
              if (props.mode == "chat") {
                navigate("/calendar");
              }
            }}
          >
            <p className="">Schedule</p>
          </div>
        </div>
        <div className="py-2 pb-3 bg-green-400" />
      </div>
      <div
        className="px-10 py-4 flex flex-row justify-center items-center border-l-2 bg-black cursor-pointer hover:invert mix-blend-difference select-none"
        onClick={() => setIsProfileOpen(!isProfileOpen)}        
      >
        <p className="text-gray-400 font-bold">{`Hi, ${userInfo.name}`}</p>
      </div>
      {isProfileOpen && (
        <div
          className="absolute right-0 top-14 bg-white dark:bg-black border-2 shadow-lg rounded-lg mt-2 p-4 min-w-48 flex flex-col z-10"
          ref={menuRef}
        >
          <p>{`${userInfo.name}`}</p>
          <p className="text-sm text-gray-400">{`${userInfo.email}`}</p>
          <div className="my-2 border-b-gray-500 border-b-2 shadow-lg" />
          <p
            className="hover:text-gray-400 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            Profile Setting
          </p>
          <p
            className="hover:text-gray-400 cursor-pointer"
            onClick={async () => {
              const accessToken = document.cookie
                .split("; ")
                .reduce((prev, curr) => {
                  const parts = curr.split("=");
                  return parts[0] === "access_token" ? parts[1] : prev;
                }, "");
              const refreshToken = document.cookie
                .split("; ")
                .reduce((prev, curr) => {
                  const parts = curr.split("=");
                  return parts[0] === "refresh_token" ? parts[1] : prev;
                }, "");
              await axios
                .post("http://localhost:5003/api/auth/logout", {
                  accessToken: accessToken,
                  refreshToken: refreshToken,
                })
                .catch(function (error) {
                  console.error(error);
                });
              document.cookie = `access_token=none; SameSite=Strict; expires=${new Date(
                0,
              ).toUTCString()}; path=/`;
              document.cookie = `refresh_token=none; SameSite=Strict; expires=${new Date(
                0,
              ).toUTCString()}; path=/`;
              window.location.reload();
            }}
          >
            Logout
          </p>
        </div>
      )}
    </div>
  );
};


export default TopBar;
