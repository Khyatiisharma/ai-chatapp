import { useContext, useState } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

function Login() {
  const { setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    axios
      .post("/users/login", {
        email,
        password,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        console.log(res.data);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
  //     <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
  //       {/* Title */}
  //       <h2 className="text-3xl font-bold text-center text-gray-800">
  //         Welcome Back
  //       </h2>
  //       <p className="text-center text-gray-500 mt-2">
  //         Login to your account
  //       </p>

  //       {/* Form */}
  //       <form  onSubmit={submitHandler}

  //       className="mt-8 space-y-6">
  //         {/* Email */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700">
  //             Email Address
  //           </label>
  //           <input
  //             onChange={(e)=> setEmail(e.target.value)}

  //             type="email"
  //             placeholder="you@example.com"
  //             className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
  //           />
  //         </div>

  //         {/* Password */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700">
  //             Password
  //           </label>
  //           <input

  //             onChange={(e)=> setPassword(e.target.value)}

  //             type="password"
  //             placeholder="••••••••"
  //             className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
  //           />
  //         </div>

  //         {/* Button */}
  //         <button
  //           type="submit"
  //           className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300"
  //         >
  //           Login
  //         </button>
  //       </form>

  //       {/* Register link */}
  //       <p className="mt-6 text-center text-gray-600">
  //         Don’t have an account?{" "}
  //         <a href="/register" className="text-indigo-600 font-medium hover:underline">
  //           Register
  //         </a>
  //       </p>
  //     </div>
  //   </div>
  // );
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mt-2 text-sm">
          Login to your account
        </p>

        {/* Form */}
        <form onSubmit={submitHandler} className="mt-8 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 mt-6 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-all duration-300 ease-in-out"
          >
            Login
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-sky-600 font-medium hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
