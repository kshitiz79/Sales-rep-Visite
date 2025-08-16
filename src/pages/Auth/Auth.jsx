import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";

const Auth = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        'Super Admin': '/admin',
        'Admin': '/admin',
        'Opps Team': '/admin',
        'State Head': '/admin',
        'National Head': '/user',
        'Zonal Manager': '/user',
        'Area Manager': '/user',
        'Manager': '/user',
        'User': '/user',
      };
      
      const redirectPath = roleRoutes[user.role] || '/user';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      console.log("Login response:", data);

      // Merge headOffice into user object
      const userData = {
        ...data.user,
        headOffice: data.user.headOffice || data.headOffice?.id || null,
      };

      login(userData, data.token);

      // Navigate based on role
      const roleRoutes = {
        'Super Admin': '/admin',
        'Admin': '/admin',
        'Opps Team': '/admin',
        'State Head': '/admin',
        'National Head': '/user',
        'Zonal Manager': '/user',
        'Area Manager': '/user',
        'Manager': '/user',
        'User': '/user',
      };
      
      const redirectPath = roleRoutes[userData.role] || '/user';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
