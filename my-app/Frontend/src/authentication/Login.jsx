import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import api from "../services/apiInstance";
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from "../utils/LanguageContext";
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import Logo from '../Logo';




const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Use proxy-friendly relative path or api instance
      const response = await api.post("/api/users/login", {
        email: formData.email,
        password: formData.password
      });

      // Backend returns { token, userId, name, verified, role }
      const { token, userId, name, verified, role } = response.data;

      if (!token) {
        setMessage("Login failed. No token received.");
        return;
      }

      // Save JWT token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);
      localStorage.setItem("activeRole", role === "admin" ? "admin" : "user");

        // after successful login, show success dialog before navigating
        if (role === "admin") {
          toast.success(t('welcome_back_admin') || 'Welcome back, Admin!');
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        } else if (!verified) {
          navigate("/verify-otp");
        } else {
          toast.success(t('welcome_back_user') || 'Login successful!');
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }

    } catch (err) {
      console.error("Login error details:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
        data: err.response?.data
      });

      if (err.message === "Network Error" || !err.response) {
        setMessage("Cannot connect to server. Make sure backend is running on port 5001");
      } else if (err.response?.status === 404) {
        setMessage(t('user_not_found') || "User not found. Please sign up first.");
      } else if (err.response?.status === 401) {
        setMessage(t('user_not_found') || "User does not exist");
      } else if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage(t('login_failed') || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        console.log('Google login success, exchanging token...');
        const res = await axios.post('/api/users/google-login', {
          token: tokenResponse.access_token,
        });

        const { token, userId, name, role, verified } = res.data;
        
        // Save session data
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', name);
        localStorage.setItem('userRole', role);
        localStorage.setItem("activeRole", role === "admin" ? "admin" : "user");

        setMessage("");
        
        if (role === "admin") {
          toast.success(t('welcome_back_admin') || 'Welcome back, Admin!');
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        } else if (verified === false) {
          navigate("/verify-otp");
        } else {
          toast.success(t('welcome_back_user') || 'Login successful!');
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } catch (err) {
        console.error('Google exchange error:', err);
        setMessage('Failed to complete Google Login: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      console.log('Starting Google Login flow...');
      googleLogin();
      return;
    }
    
    console.log(`Social provider not fully integrated: ${provider}`);
    toast.info(`${provider} login is coming soon!`);
  };
  return (
    <div className="min-h-screen bg-cyan-100 flex flex-col">
      <div className="p-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <BackButton variant="simple" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <div className="flex justify-center mb-6">
          <Logo isStatic={true} />
        </div>
        <h1 className="text-3xl font-bold text-teal-900 mb-6 text-center">{t('login')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('enter_email')}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('enter_password')}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                {t('remember_me')}
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-teal-600 font-medium hover:text-teal-700"
            >
              {t('forgot_password')}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? t('logging_in') : t('sign_in')}
            <ArrowRight size={18} />
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('dont_have_account')}{" "}
          <Link to="/signup" className="text-teal-600 font-semibold hover:text-teal-700">
            {t('sign_up_here')}
          </Link>
        </p>

        {/* Social Login Section */}
        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-4 text-sm text-gray-500 absolute">{t('or_continue_with')}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.11-.02-1.47-.7-2.74-.7-1.27 0-1.68.68-2.74.72-1.11.04-2.23-.87-3.23-1.82-2.04-1.94-3.59-5.48-1.5-9.1 1.04-1.8 2.89-2.94 4.58-2.97 1.29-.02 2.5.87 3.29.87.79 0 2.26-1.07 3.81-.91 1.65.07 2.9.66 3.74 1.89-3.34 2.01-2.81 6.13.55 7.51-.73 1.83-1.74 3.61-3.57 5.75zM12.03 7.25c-.02-2.23 1.84-4.13 4.04-4.25.02 2.23-1.84 4.13-4.04 4.25z"
                />
              </svg>
              Apple
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>

  );

};

export default Login;
