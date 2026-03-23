import { useState, useRef } from "react";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const { login, loading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [stayAuthenticated, setStayAuthenticated] = useState(false);
  const emailInputEl = useRef(null);
  const passwordInputEl = useRef(null);

  function onEmailInputClick() {
    emailInputEl.current.focus();
  }

  function onPasswordInputClick() {
    passwordInputEl.current.focus();
  }

  async function handleLoginButtonClick() {
    if (!emailInputEl.current || !passwordInputEl.current) return;
    const email = emailInputEl.current.value;
    const password = passwordInputEl.current.value;

    const result = await login(email, password);
    console.log(result);
    if (result.success) {
      navigate('/dashboard');
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .error-banner {
          animation: slideDown 0.3s ease-out, shake 0.4s ease-out 0.15s;
        }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-background)] sm:bg-[var(--color-background)]">
        <div
          className="
            w-full h-screen sm:h-auto
            sm:w-[420px] sm:rounded-3xl sm:shadow-2xl
            bg-[var(--color-surface-container)]
            flex flex-col items-center justify-center
            px-8 py-12 gap-8
            relative overflow-hidden
          "
        >
          {/* Subtle noise/glow behind card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(128,131,255,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Logo Icon */}
          <div
            className="
              w-14 h-14 rounded-2xl
              bg-[var(--color-inverse-primary)]
              flex items-center justify-center
              shadow-lg relative z-10
            "
            style={{ boxShadow: "0 8px 32px rgba(73,75,214,0.45)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--color-primary)]"
            >
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M7 9l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center relative z-10 space-y-1">
            <h1 className="text-3xl font-bold text-[var(--color-on-surface)] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-on-surface-variant)] uppercase">
              Sign in to your CMS
            </p>
          </div>

          {/* ── Login Failed Banner ── */}
          {error && (
            <div
              className="error-banner relative z-10 w-full flex items-start gap-3 rounded-2xl px-4 py-3.5"
              style={{
                background: "rgba(255, 107, 107, 0.10)",
                border: "1px solid rgba(255, 107, 107, 0.35)",
              }}
            >
              {/* Icon */}
              <div
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "rgba(255, 107, 107, 0.2)" }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M4 4l4 4M8 4L4 8"
                    stroke="#ff6b6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold tracking-[0.1em] uppercase" style={{ color: "#ff6b6b" }}>
                  Authentication Failed
                </span>
                <span className="text-xs" style={{ color: "rgba(255,107,107,0.75)" }}>
                  Invalid email or password. Please try again.
                </span>
              </div>

              {/* Dismiss */}
              <button
                onClick={clearError}
                className="ml-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                style={{ color: "#ff6b6b" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <div className="w-full flex flex-col gap-5 relative z-10">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)]">
                Email Address
              </label>
              <div
                onClick={onEmailInputClick}
                className="
                  cursor-text flex items-center gap-3
                  bg-[var(--color-surface-container-high)]
                  border rounded-2xl px-4 py-3.5
                  focus-within:border-[var(--color-primary-container)]
                  transition-colors duration-200
                "
                style={{
                  borderColor:
                    error 
                      ? "rgba(255,107,107,0.4)"
                      : "var(--color-outline-variant)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-outline)] shrink-0">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  ref={emailInputEl}
                  type="email"
                  placeholder="dev@obsidian.io"
                  className="
                    flex-1 bg-transparent outline-none
                    text-sm text-[var(--color-on-surface)]
                    placeholder:text-[var(--color-outline)]
                    caret-[var(--color-primary)]
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)]">
                  Password
                </label>
                <button className="text-xs font-bold tracking-[0.1em] uppercase text-[var(--color-primary-container)] hover:text-[var(--color-primary)] transition-colors">
                  Forgot?
                </button>
              </div>
              <div
                onClick={onPasswordInputClick}
                className="
                  cursor-text flex items-center gap-3
                  bg-[var(--color-surface-container-high)]
                  border rounded-2xl px-4 py-3.5
                  focus-within:border-[var(--color-primary-container)]
                  transition-colors duration-200
                "
                style={{
                  borderColor:
                    error 
                      ? "rgba(255,107,107,0.4)"
                      : "var(--color-outline-variant)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-outline)] shrink-0">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  ref={passwordInputEl}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="
                    flex-1 bg-transparent outline-none
                    text-sm text-[var(--color-on-surface)]
                    placeholder:text-[var(--color-outline)]
                    caret-[var(--color-primary)]
                  "
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--color-outline)] hover:text-[var(--color-on-surface-variant)] transition-colors shrink-0"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3l18 18M10.5 10.677A3 3 0 0013.323 13.5M6.362 6.368C4.56 7.615 3.106 9.375 2 12c1.889 4.557 5.863 7.5 10 7.5 1.71 0 3.34-.47 4.772-1.314M9.5 4.805A9.558 9.558 0 0112 4.5c4.137 0 8.111 2.943 10 7.5-.666 1.605-1.6 3.026-2.728 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <ellipse cx="12" cy="12" rx="10" ry="6" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Stay Authenticated */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setStayAuthenticated(!stayAuthenticated)}
                className={`
                  w-5 h-5 rounded-[5px] border flex items-center justify-center
                  transition-colors duration-150 shrink-0
                  ${
                    stayAuthenticated
                      ? "bg-[var(--color-primary-container)] border-[var(--color-primary-container)]"
                      : "bg-transparent border-[var(--color-outline-variant)] group-hover:border-[var(--color-outline)]"
                  }
                `}
              >
                {stayAuthenticated && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => setStayAuthenticated(!stayAuthenticated)}
                className="text-sm text-[var(--color-on-surface-variant)] select-none"
              >
                Stay authenticated
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="button"
            onClick={handleLoginButtonClick}
            disabled={loading}
            className="
              cursor-pointer
              relative z-10 w-full
              bg-[var(--color-primary)]
              text-[var(--color-on-primary)]
              font-bold text-sm tracking-[0.15em] uppercase
              py-4 rounded-full
              flex items-center justify-center gap-3
              hover:brightness-110 active:scale-[0.98]
              transition-all duration-150
              shadow-lg disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? "Signing In…" : "Sign In"}
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}