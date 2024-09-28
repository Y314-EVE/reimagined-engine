const Login = () => {
  return (
    <div className="flex flex-row flex-1 m-8">
      <p className="ml-4 mr-1 p-2">Email</p>
      <input type="email" className="w-48 border-2 rounded" />
      <p className="ml-4 mr-1 p-2">Password</p>
      <input type="password" className="w-48 border-2 rounded" />
      <button
        type="button"
        className="mx-4 py-1 border-2 rounded border-gray-100 bg-sky-100"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
