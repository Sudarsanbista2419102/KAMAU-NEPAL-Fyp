import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  const [strengthScore, setStrengthScore] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Get resetUserId from sessionStorage (set by ForgotPassword)
  const resetUserId = sessionStorage.getItem('resetUserId');

  useEffect(() => {
    if (!resetUserId) {
      toast.error('Session expired. Please request a new password reset link.');
      navigate('/forgot-password');
    }
  }, [resetUserId, navigate]);

  const checkPasswordStrength = (pass) => {
    const length = pass.length >= 8;
    const upper = /[A-Z]/.test(pass);
    const lower = /[a-z]/.test(pass);
    const number = /[0-9]/.test(pass);
    const special = /[!@#$%^&*()_+[\]:;<>,.?~\/-]/.test(pass);

    setPasswordStrength({ length, upper, lower, number, special });

    let score = 0;
    if (length) score++;
    if (upper) score++;
    if (lower) score++;
    if (number) score++;
    if (special) score++;
    setStrengthScore(score);
  };

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setNewPassword(pass);
    checkPasswordStrength(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (!resetUserId) {
      toast.error('Session expired. Please request a new password reset link.');
      navigate('/forgot-password');
      return;
    }

    if (otp.includes('')) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please enter and confirm your new password');
      return;
    }

    // Validate password strength
    if (strengthScore < 5) {
      toast.error('Password does not meet security requirements. Must include uppercase, lowercase, number, and special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/users/reset-password', {
        userId: resetUserId,
        otp: otpCode,
        newPassword
      });

      setIsSuccess(true);
      toast.success(response.data.message || 'Password reset successful!');
      sessionStorage.removeItem('resetUserId');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error resetting password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
      <div className="p-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <BackButton variant="simple" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 mb-4">
                <Lock className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold text-teal-900">Set New Password</h1>
              <p className="mt-2 text-gray-600">Enter the OTP sent to your email and your new password</p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    6-Digit Verification Code
                  </label>
                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    disabled={loading}
                  />
                  
                  {/* Password Strength Meter */}
                  {newPassword && (
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
                        {strengthScore < 3 && 'Weak password'}
                        {strengthScore >= 3 && strengthScore < 5 && 'Fair password'}
                        {strengthScore === 5 && 'Strong password'}
                      </p>
                      {strengthScore < 5 && (
                        <ul className="mt-2 space-y-1 text-gray-500 font-medium">
                          <li className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-600" : ""}`}>
                            {passwordStrength.length ? "✓" : "○"} At least 8 characters
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.upper ? "text-green-600" : ""}`}>
                            {passwordStrength.upper ? "✓" : "○"} Uppercase letter (A-Z)
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.lower ? "text-green-600" : ""}`}>
                            {passwordStrength.lower ? "✓" : "○"} Lowercase letter (a-z)
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.number ? "text-green-600" : ""}`}>
                            {passwordStrength.number ? "✓" : "○"} Number (0-9)
                          </li>
                          <li className={`flex items-center gap-1 ${passwordStrength.special ? "text-green-600" : ""}`}>
                            {passwordStrength.special ? "✓" : "○"} Special character (!@#$%^&*)
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    disabled={loading}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle size={16} />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || strengthScore < 5 || newPassword !== confirmPassword || !newPassword}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Password Reset Complete!</h2>
                <p className="mt-2 text-gray-600">You can now log in with your new password.</p>
                <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
