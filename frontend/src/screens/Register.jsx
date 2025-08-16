import { useNavigate } from "react-router-dom";
import axios from '../config/axios'
import { useContext, useState } from "react";
import {UserContext} from '../context/user.context'





function Register() {
  const [email,setEmail] = useState('');
  const [password , setPassword] = useState('');
  const navigate = useNavigate();
   const { setUser } = useContext(UserContext)


  function submitHandle(e) {
    e.preventDefault();
    axios.post('/users/register',{
      email,
      password
    }).then((res)=>{
      console.log(res.data)
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/')
    }).catch((err) => {
      if (err.response) {
        console.log("Error:", err.response.data);
      } else {
        console.log("Network/Server error:", err.message);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Sign up with your email and password
        </p>

        {/* Form */}
        <form 
            onSubmit={submitHandle}
        className="mt-8 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input

            onChange={(e)=> setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input

                onChange={(e)=> setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
