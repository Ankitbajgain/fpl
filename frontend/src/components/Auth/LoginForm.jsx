import { useState } from "react";

export function LoginForm({ onSubmit, isLoading, error, notice }) {
  const [form, setForm] = useState({
    email: "manager1@newfpl.local",
    password: "ManagerPass123",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    onSubmit(email, form.password);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, email: e.target.value }))
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0b2b57]"
        placeholder="Email"
        required
      />
      {emailError && <p className="text-xs text-red-600">{emailError}</p>}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-[#0b2b57]"
          placeholder="Password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      {notice && <p className="text-xs text-green-700">{notice}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#1e4a8a] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center">
        <a href="#" className="text-xs text-[#0b2b57] hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}
