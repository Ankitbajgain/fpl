import { useState } from "react";
import { registerDefaults } from "../../constants/gameConfig";
import {
  createNameFromEmail,
  createPhoneFromEmail,
} from "../../utils/formatting";

export function RegisterForm({ onSubmit, isLoading, error, notice }) {
  const [form, setForm] = useState(registerDefaults);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const { password, confirmPassword } = form;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");

    if (!email || !password) return;

    const name = createNameFromEmail(email);
    const phone = createPhoneFromEmail(email);

    onSubmit(email, password, name, phone);
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

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-[#0b2b57]"
          placeholder="Confirm password"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </button>
      </div>
      {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}

      {notice && <p className="text-xs text-green-700">{notice}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#1e4a8a] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
