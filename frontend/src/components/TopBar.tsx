import axios from "axios";

const TopBar = () => {
  return (
    <div className="flex flex-row flex-1 justify-end border-b-2 shadow px-4 py-2">
      <button
        type="button"
        onClick={() => {
          // axios.post("http://localhost:5000/api/auth/logout");
          document.cookie = `access_token=none; SameSite=Strict; expires=${new Date(
            0
          ).toUTCString()}; path=/`;
          document.cookie = `refresh_token=none; SameSite=Strict; expires=${new Date(
            0
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
