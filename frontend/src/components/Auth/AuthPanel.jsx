import { useState } from "react";
import logo from "../../assets/logo.png";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthPanel({
  onLogin,
  onRegister,
  isLoading,
  error,
  notice,
  setNotice,
  setError,
}) {
  const [authMode, setAuthMode] = useState("login");

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setError("");
    setNotice("");
  };

  return (
    <div className="min-h-screen w-full bg-[#0b2b57] flex items-center justify-center px-4">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
        {/* LEFT SIDE (2/3 width) */}
        <div className="text-white flex flex-col justify-center px-4 md:col-span-2">
          <img src={logo} alt="Logo" className="w-2/3 mb-6 drop-shadow-xl" />

          <h1 className="text-4xl font-extrabold leading-tight">
            New FPL Fantasy League
          </h1>

          <p className="mt-4 text-lg text-white/80 max-w-lg">
            Create your dream squad. Compete globally. Rule the leaderboard.
            Your fantasy journey starts here.
          </p>
        </div>

        {/* RIGHT SIDE (1/3 width) */}
        <div className="flex justify-center md:col-span-1">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0b2b57] to-[#1e4a8a] text-white px-6 py-6">
              <h2 className="text-2xl font-bold">Welcome</h2>
              <p className="text-sm text-white/80">
                Login or create an account to continue.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mt-4 bg-gray-100 rounded-xl mx-5">
              <button
                onClick={() => handleModeChange("login")}
                className={`flex-1 py-2 px-4 font-semibold rounded-lg transition ${
                  authMode === "login"
                    ? "bg-[#0b2b57] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => handleModeChange("register")}
                className={`flex-1 py-2 px-4 font-semibold rounded-lg transition ${
                  authMode === "register"
                    ? "bg-[#0b2b57] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Register
              </button>
            </div>

            {/* Forms */}
            <div className="px-6 pb-3 pt-5">
              {authMode === "login" ? (
                <LoginForm
                  onSubmit={onLogin}
                  isLoading={isLoading}
                  error={error}
                  notice={notice}
                />
              ) : (
                <RegisterForm
                  onSubmit={onRegister}
                  isLoading={isLoading}
                  error={error}
                  notice={notice}
                />
              )}
            </div>

            {/* TERMS & CONDITIONS */}
            <p className="text-[11px] text-gray-500 text-center px-6 pb-5">
              By logging in or registering, you agree to our{" "}
              <span className="text-[#0b2b57] font-semibold cursor-pointer hover:underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="text-[#0b2b57] font-semibold cursor-pointer hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
