import React from 'react';
import { PencilLine, ChevronRight } from 'lucide-react';

const Login = ({
  step,
  mobileNumber,
  setMobileNumber,
  setStep,
  password,
  setPassword,
  otp,
  handleOtpChange,
  handleMobileSubmit,
  handlePasswordSubmit,
  handleVerifyOtp,
  isLoading
}) => {
  return (
    <>
      {(step === 'mobile' || step === 'otp' || step === 'password') && (
        <div className="absolute inset-0 flex flex-col w-full h-full bg-white z-50 overflow-hidden no-scrollbar">
          <div className="w-full pt-6 px-1">
            <img src="/IFB.png" alt="IFB" className="h-28 w-auto object-contain opacity-90" />
          </div>

          <div className="flex-[2] flex items-center justify-center -mt-12 px-4">
            <div className="w-full h-full flex items-center justify-center relative">
              <img src="/bsepic.png" alt="Illustration" className="w-[85%] h-[110%] object-contain transition-transform duration-1000 scale-105" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end px-10 pb-12">
            <div className="mb-6">
              <h1 className="text-[32px] font-bold text-slate-900 leading-[1.15] tracking-tight">
                Enter your <br />
                <span className="text-slate-400 font-semibold">
                  {step === 'mobile' ? 'user id' : step === 'otp' ? 'verification code' : 'password'}
                </span>
              </h1>
              {step === 'mobile' && (
                <p className="text-[13px] text-slate-400 mt-2 font-medium">
                  Enter your email, employee ID or phone number
                </p>
              )}
              {(step === 'otp' || step === 'password') && (
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">{mobileNumber}</p>
                  <button onClick={() => setStep('mobile')} className="text-slate-900/40 hover:text-slate-900 transition-colors">
                    <PencilLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative border-b-2 border-slate-100 py-5 mb-8">
              {step === 'mobile' ? (
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Email, ID or Phone"
                    className="flex-1 text-xl font-bold bg-transparent focus:outline-none placeholder:text-slate-100 text-slate-900"
                  />
                </div>
              ) : step === 'otp' ? (
                <div className="flex items-center gap-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-8 text-3xl font-bold bg-transparent focus:outline-none text-slate-900 text-center border-b-2 border-transparent focus:border-slate-900"
                      placeholder="•"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="flex-1 text-xl font-bold bg-transparent focus:outline-none placeholder:text-slate-100 text-slate-900"
                    autoFocus
                  />
                </div>
              )}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <button
                  onClick={step === 'mobile' ? handleMobileSubmit : step === 'otp' ? handleVerifyOtp : handlePasswordSubmit}
                  className={`flex items-center justify-center transition-all duration-300 active:scale-75 text-slate-900 ${((step === 'mobile' && mobileNumber.length > 0) ||
                      (step === 'otp' && otp.every(v => v !== '')) ||
                      (step === 'password' && password.length > 0))
                      ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                >
                  {isLoading ? <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" /> : <ChevronRight className="w-8 h-8" strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
