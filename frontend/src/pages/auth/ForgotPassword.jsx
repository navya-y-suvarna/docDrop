import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-600">
          Enter your registered email and we'll send you recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Check your inbox</p>
              <p className="text-xs text-slate-600">
                If an account exists for {email}, password reset instructions have been sent.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-block"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 flex items-center justify-center gap-2"
              >
                Send Reset Link
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-600 pt-2">
                <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
