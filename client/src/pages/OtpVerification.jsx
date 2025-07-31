import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OtpVerification =()=> {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const Navigate = useNavigate();
  const location = useLocation();
  const { email, userData } = location.state || {};
  const { accountCreation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const isCodeComplete = code.every(digit => digit !== '');

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const enteredCode = code.join('');
      const result = await accountCreation(email, enteredCode, userData);
      
      if (result.success) {
        setIsLoading(false);
        setIsSubmitted(true);
    // Reset after showing success
     setTimeout(() => {
      setIsSubmitted(false);
      setCode(['', '', '', '', '', '']);
    }, 2000);
        Navigate('/chat');
      } else {
        alert(result.error || 'Failed to confirm OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming OTP:', error);
      alert('Failed to confirm OTP. Please try again.');
    }
  };

  const handleResend = () => {
    alert('Verification code resent!');
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo - matching the provided image */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-blue-600 fill-current" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Chattrix
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-center mb-2">
          Enter the 6-digit verification code
        </p>
        <p className="text-gray-500 text-sm text-center mb-8">
          We sent it to your device
        </p>

        {/* Verification Code Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                digit
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
              }`}
            />
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!isCodeComplete}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isCodeComplete
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirm
        </button>

        {/* Resend Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600 text-sm">Didn't receive the code? </span>
          <button
            onClick={handleResend}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200"
          >
            Resend
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Secure verification powered by Chattrix
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;