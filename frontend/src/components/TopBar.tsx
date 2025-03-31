import axios from "axios";

const TopBar = () => {
  return (
    <div className="flex flex-row flex-1 justify-end border-b-2 shadow px-4 py-2">
      <button
        type="button"
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
            .post("http://localhost:5000/api/auth/logout", {
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
        className="bg-red-300 mix-blend-difference"
      >
        Logout
      </button>
    </div>
  );
};

export default TopBar;
