import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import BackButton from '../components/BackButton';


import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Get userId from localStorage (saved in signup)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (timer > 0 && !isVerified) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isVerified]);

  const handleChange = (index, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    console.log('Submit button clicked, OTP Code:', otpCode);

    if (!userId) {
      alert('User not found. Please signup again.');
      navigate('/signup');
      return;
    }

    if (otp.includes('')) {
      alert('Please fill in all OTP fields');
      return;
    }

    if (otpCode.length !== 6) {
      alert('Please enter all 6 digits of the OTP');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending OTP verification request...');
      const response = await axios.post('/api/users/verify-otp', {
        userId,
        otp: otpCode,
      });

      console.log('OTP verification response:', response.data);

      if (response.data.token && response.data.isVerified) {
        // Save JWT token and verification status
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isVerified', 'true');
        setIsVerified(true);
        console.log('Email verified successfully!');

        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        alert(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error verifying OTP. Try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) return alert('User not found. Please signup again.');
    setTimer(60);
    try {
      await axios.post('/api/users/resend-otp', { userId });
      alert('New OTP sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend OTP. Try again.');
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
              <div className="text-2xl font-bold text-teal-600">🔒</div>
            </div>
            <h1 className="text-2xl font-bold text-teal-900">Verify OTP</h1>
            <p className="mt-2 text-gray-600">Enter the 6-digit code sent to your email</p>
          </div>

          {!isVerified ? (
            <>
              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer and Resend */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock size={16} />
                  <span>Resend code in: {timer}s</span>
                </div>
                <button
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                  className={`text-sm font-medium ${
                    timer > 0 || loading ? 'text-gray-400' : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  Didn't receive code? Resend
                </button>
              </div>

              {/* Confirm Button */}
              <form onSubmit={handleSubmit} className="mb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {loading ? 'Verifying...' : 'Confirm OTP'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verified Successfully!</h2>
              <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};



export default VerifyOTP;
