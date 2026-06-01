import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../services/apiInstance'; // Use centralized api instance
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from '../utils/LanguageContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import Logo from '../Logo';



const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [emailError, setEmailError] = useState('');

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  const [strengthScore, setStrengthScore] = useState(0);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const checkPasswordStrength = (pass) => {
    const length = pass.length >= 8;
    const upper = /[A-Z]/.test(pass);
    const lower = /[a-z]/.test(pass);
    const number = /[0-9]/.test(pass);
    const special = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(pass);

    setPasswordStrength({ length, upper, lower, number, special });

    let score = 0;
    if (length) score++;
    if (upper) score++;
    if (lower) score++;
    if (number) score++;
    if (special) score++;
    setStrengthScore(score);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('');
      return false;
    } else if (!regex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    if (name === 'email') {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error('Please provide a valid email address.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (strengthScore < 5) {
      toast.error('Please use a stronger password meeting all requirements.');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('You must agree to Terms and Privacy Policy!');
      return;
    }

    try {
      // Prepare payload
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        address: "Not specified", // Default address since it's required by backend
      };

      // Send POST request to backend
      const response = await api.post(
        '/api/users/signup',
        payload
      );

      console.log('Signup response:', response.data);

      // Save user data for profile
      const fullName = `${formData.firstName} ${formData.lastName}`;
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', formData.email);

      // Navigate to OTP verification page
      navigate('/verify-otp');
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Error connecting to backend');
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google login success, exchanging token...');
        const res = await api.post('/api/users/google-login', {
          token: tokenResponse.access_token,
        });

        const { token, userId, name, role, verified } = res.data;
        
        // Save session data
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', name);
        localStorage.setItem('userRole', role);
        localStorage.setItem("activeRole", role === "admin" ? "admin" : "user");

        if (role === "admin") {
          toast.success('Welcome back, Admin!');
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        } else if (verified === false) {
          navigate("/verify-otp");
        } else {
          toast.success('Google Login successful!');
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } catch (err) {
        console.error('Google exchange error:', err);
        toast.error('Failed to complete Google Login: ' + (err.response?.data?.message || err.message));
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
    <div className="min-h-screen bg-cyan-100 flex flex-col font-sans">

      <div className="p-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <BackButton variant="simple" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="lg:w-1/2 p-5 md:p-8">
            <div className="mb-4">
              <div className="mb-4">
                <Logo isStatic={true} />
              </div>
              <h1 className="text-3xl font-bold text-orange-500">{t('create_your_account')}</h1>
              <p className="mt-2 text-gray-600">
                {t('join_community')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('first_name')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('enter_first_name')}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('last_name')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('enter_last_name')}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('enter_email')}
                    required
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${
                      emailError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t('create_password')}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-3 text-xs">
                      <div className="flex gap-1 h-1.5 mt-1 rounded-full overflow-hidden bg-gray-200">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <div
                            key={val}
                            className={`flex-1 ${
                              strengthScore >= val
                                ? strengthScore < 3
                                  ? 'bg-red-500'
                                  : strengthScore < 5
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 font-medium ${
                        strengthScore < 3 ? 'text-red-500' : strengthScore < 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {strengthScore < 3 && t('weak_password')}
                        {strengthScore >= 3 && strengthScore < 5 && t('fair_password')}
                        {strengthScore === 5 && t('strong_password')}
                      </p>
                      {strengthScore < 5 && (
                        <ul className="mt-2 space-y-1 text-gray-500 font-medium">
                          <li className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-600" : ""}`}>
                            {passwordStrength.length ? "✓" : "○"} {t('password_req_1')}
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.upper ? "text-green-600" : ""}`}>
                            {passwordStrength.upper ? "✓" : "○"} {t('password_req_2')}
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.lower ? "text-green-600" : ""}`}>
                            {passwordStrength.lower ? "✓" : "○"} {t('password_req_3')}
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.number ? "text-green-600" : ""}`}>
                            {passwordStrength.number ? "✓" : "○"} {t('password_req_4')}
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.special ? "text-green-600" : ""}`}>
                            {passwordStrength.special ? "✓" : "○"} {t('password_req_5')}
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t('confirm_password_placeholder')}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                  {t('agree_to_terms_1')}{' '}
                  <Link to="/terms" className="text-teal-600 font-medium hover:text-teal-700">
                    {t('terms_of_service')}
                  </Link>{' '}
                  {t('agree_to_terms_2')}{' '}
                  <Link to="/privacy" className="text-teal-600 font-medium hover:text-teal-700">
                    {t('privacy_policy')}
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98]"
              >
                {t('create_account')}
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Social Login Section */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-4 text-sm text-gray-500 absolute">{t('or_continue_with')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
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
                  className="flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
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

            <div className="mt-8 text-center text-sm">
              {t('already_have_account')}{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
                {t('sign_in')}
              </Link>
            </div>
          </div>

          {/* Right Side Hero */}
          <div className="lg:w-1/2 relative overflow-hidden hidden lg:flex items-center justify-center">
            <img 
              src="/assets/Signup.jpeg" 
              alt="Professional Growth" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-[2px]"></div>
            <div className="relative z-10 text-center text-white p-12">
              <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">{t('launch_career')}</h2>
              <p className="text-xl opacity-95 mb-8 max-w-md mx-auto drop-shadow-md">
                {t('launch_desc')}
              </p>
              <div className="flex justify-center gap-4 mt-12">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};



export default SignupForm;