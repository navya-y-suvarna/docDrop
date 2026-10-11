import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Share2,
  Printer,
  ShieldCheck,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  QrCode,
  Download,
  Search,
} from "lucide-react";

export const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoUserLogin = async () => {
    try {
      await login("demo@docdrop.com", "Demo@123");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoAdminLogin = async () => {
    try {
      await login("admin@docdrop.com", "Admin@123");
      navigate("/admin/queue");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Doc<span className="text-brand-600">Drop</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Next-Gen Document Hub & Smart Print Drop
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Store, Share & Print Documents{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Without the Hassle.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            DocDrop turns document management into an effortless experience. Upload files, generate unguessable encrypted links with passcodes, and send print orders straight to local shops with contactless QR pickup.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-7 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                Open My Vault
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Instant 1-Click Demo Buttons */}
                <button
                  onClick={handleDemoUserLogin}
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all"
                >
                  Quick Demo User
                </button>
                <button
                  onClick={handleDemoAdminLogin}
                  className="px-6 py-3.5 rounded-xl font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 shadow-sm transition-all"
                >
                  Shop Admin Demo
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              All-In-One Architecture
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Everything you need for seamless document workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Document Vault</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Store PDFs, images, spreadsheets, code, and documents up to 25MB. Instant inline previews, tag categorization, fast search, and metadata inspection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unguessable Secure Sharing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate cryptographic tokens with custom expiration timestamps, bcrypt password protection, download limit ceilings, and instant one-click revocation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg hover:border-purple-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Print & Xerox Drop</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Configure print options (B&W or Color, A4/A3, duplex, staple, spiral binding) with live pricing. Pick up effortlessly with your contactless QR ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Walkthrough */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Simple & Fast
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              How DocDrop works in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Upload or Drag-and-Drop</h4>
              <p className="text-xs text-slate-600">
                Drop your documents into the vault. Automatic file sanitization and instant categorization keep your files safe and organized.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Share or Configure Print</h4>
              <p className="text-xs text-slate-600">
                Create password-protected links with custom expiration, or select print preferences with upfront, transparent pricing.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Instant Access & Pickup</h4>
              <p className="text-xs text-slate-600">
                Recipients preview files online safely, and print shop customers scan their QR ticket at the counter with zero wait time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to experience DocDrop?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Experience the modern document management and smart print queue platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md"
            >
              Sign Up Now
            </Link>
            <button
              onClick={handleDemoUserLogin}
              className="px-7 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md"
            >
              Launch Demo User
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
