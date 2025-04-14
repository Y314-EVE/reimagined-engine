import axios from "axios";

const tokenUpdate = async () => {
  if (
    !document.cookie.includes("access_token") &&
    document.cookie.includes("refresh_token")
  ) {
    const refreshToken = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "refresh_token" ? parts[1] : prev;
    }, "");
    const updateTokenPairResponse = await axios.put(
      "http://localhost:5003/api/auth/update-token-pair",
      { refreshToken: refreshToken },
      {
        headers: {
          Authorization: refreshToken,
        },
      },
    );
    if (updateTokenPairResponse.data.code === 200) {
      document.cookie = `access_token=${
        updateTokenPairResponse.data.accessToken
      }; SameSite=Strict; expires=${new Date(
        Date.now() + 15 * 60e3,
      ).toUTCString()}; path=/`;
      document.cookie = `refresh_token=${
        updateTokenPairResponse.data.refreshToken
      }; SameSite=Strict; expires=${new Date(
        Date.now() + 30 * 864e5,
      ).toUTCString()}; path=/`;
    }
  }
};

export default tokenUpdate;
