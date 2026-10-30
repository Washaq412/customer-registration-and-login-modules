import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LockKeyhole,
  UserRound,
  Phone,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const EMPTY = {
  fullName: "",
  mobileNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

function passwordChecks(password) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

function passwordStrength(password) {
  const score = passwordChecks(password).filter((x) => x.ok).length;

  if (!password) return { score: 0, label: "Not set", level: "" };
  if (score <= 2) return { score, label: "Weak", level: "weak" };
  if (score <= 3) return { score, label: "Medium", level: "medium" };
  if (score <= 4) return { score, label: "Strong", level: "strong" };

  return { score, label: "Very strong", level: "very-strong" };
}

function validate(form) {
  const errors = {};
  const name = form.fullName.trim();

  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (
    name.length < 3 ||
    name.length > 50 ||
    !/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(name)
  ) {
    errors.fullName = "Use letters and spaces only (3–50 characters).";
  }

  if (!/^\d{10}$/.test(form.mobileNumber)) {
    errors.mobileNumber = "Mobile number must be exactly 10 digits.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (passwordChecks(form.password).some((item) => !item.ok)) {
    errors.password = "Password must meet all five requirements.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = "You must accept the Terms & Conditions.";
  }

  return errors;
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  success,
  hint,
  children,
}) {
  return (
    <div
      className={`field ${
        error ? "field-error" : success ? "field-success" : ""
      }`}
    >
      <label htmlFor={id}>{label}</label>

      <div className="input-shell">
        {Icon && (
          <Icon
            className="input-icon"
            size={17}
            aria-hidden="true"
          />
        )}

        {children}

        {error ? (
          <AlertCircle
            className="field-status error-icon"
            size={17}
            aria-hidden="true"
          />
        ) : success ? (
          <CheckCircle2
            className="field-status success-icon"
            size={17}
            aria-hidden="true"
          />
        ) : null}
      </div>

      {error && (
        <p
          className="field-message error-message"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="field-message">{hint}</p>
      )}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [screen, setScreen] = useState("register");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [seconds, setSeconds] = useState(45);

  const errorRef = useRef(null);
  const otpRefs = useRef([]);

  const errors = useMemo(() => validate(form), [form]);
  const checks = useMemo(
    () => passwordChecks(form.password),
    [form.password]
  );
  const strength = useMemo(
    () => passwordStrength(form.password),
    [form.password]
  );

  const invalid = Object.keys(errors).length > 0;
  const email = form.email.trim().toLowerCase();

  useEffect(() => {
    if (screen !== "otp" || seconds <= 0) return undefined;

    const timer = setTimeout(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [screen, seconds]);

  const change = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const touch = (key) => {
    setTouched((old) => ({ ...old, [key]: true }));
  };

  const error = (key) =>
    touched[key] || submitted ? errors[key] : "";

  const valid = (key) => Boolean(form[key]) && !errors[key];

  function submit(event) {
    event.preventDefault();

    setSubmitted(true);
    setTouched({
      fullName: true,
      mobileNumber: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (invalid) {
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setScreen("otp");
      setSeconds(45);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
    }, 700);
  }

  function changeOtp(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((old) =>
      old.map((item, i) => (i === index ? digit : item))
    );

    setOtpError("");

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function verify(event) {
    event.preventDefault();

    if (otp.join("").length !== 6) {
      setOtpError("Enter all 6 digits to continue.");
      return;
    }

    if (otp.join("") !== "123456") {
      setOtpError("Incorrect demo OTP. Please enter 123456.");
      return;
    }

    setScreen("success");
  }

  function reset() {
    setForm(EMPTY);
    setTouched({});
    setSubmitted(false);
    setShowPassword(false);
    setShowConfirm(false);
    setScreen("register");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
  }

  return (
    <main className="app-page">
      <div
        className="background-orb orb-one"
        aria-hidden="true"
      />
      <div
        className="background-orb orb-two"
        aria-hidden="true"
      />

      <section
        className="registration-card"
        aria-labelledby="page-title"
      >
        <aside className="brand-panel">
          <div className="brand-lockup">
            <span className="brand-mark">
              <LockKeyhole size={22} />
            </span>
            <span className="brand-name">ShowPass</span>
          </div>

          <div className="brand-copy">
            <span className="eyebrow">
              <Sparkles size={14} />
              CUSTOMER PORTAL
            </span>

            <h1 id="page-title">
              {screen === "register" ? (
                <>
                  Create Your
                  <br />
                  Customer Account
                </>
              ) : screen === "otp" ? (
                <>
                  One more
                  <br />
                  security step
                </>
              ) : (
                <>
                  You’re all
                  <br />
                  set to go!
                </>
              )}
            </h1>

            <p>
              {screen === "register"
                ? "Join ShowPass and get access to amazing events, exclusive offers and more."
                : screen === "otp"
                ? "Verify your mobile number to complete registration."
                : "Your demo registration has been completed successfully."}
            </p>
          </div>

          <div className="illustration" aria-hidden="true">
            <div className="illustration-glow" />

            <div className="ticket ticket-back">
              <span>SHOW</span>
              <b>PASS</b>
            </div>

            <div className="ticket ticket-front">
              <LockKeyhole size={31} />
              <span>YOUR ACCESS</span>
              <b>ALL SET</b>
            </div>

            <div className="spark spark-a">✦</div>
            <div className="spark spark-b">✧</div>
            <div className="dot-pattern" />
          </div>

          <div className="brand-footer">
            <ShieldCheck size={16} />
            Your information stays protected
          </div>
        </aside>

        <section className="form-panel">
          {screen === "register" && (
            <>
              <header className="form-heading">
                <span className="step-label">STEP 1 OF 2</span>
                <h2>Create account</h2>
                <p>Fill in your details to get started.</p>
              </header>

              {submitted && invalid && (
                <div
                  className="error-summary"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="summary-title">
                    <AlertCircle size={18} />
                    Please correct the following errors:
                  </div>

                  <ul>
                    {Object.entries(errors).map(([key, message]) => (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById(key)?.focus()
                          }
                        >
                          {message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={submit} noValidate>
                <Field
                  id="fullName"
                  label="Full name"
                  icon={UserRound}
                  error={error("fullName")}
                  success={valid("fullName")}
                  hint="Use your name as it appears on your ID."
                >
                  <input
                    ref={
                      submitted && errors.fullName ? errorRef : null
                    }
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    maxLength={50}
                    aria-invalid={Boolean(error("fullName"))}
                    onChange={(e) =>
                      change("fullName", e.target.value)
                    }
                    onBlur={() => touch("fullName")}
                  />
                </Field>

                <Field
                  id="mobileNumber"
                  label="Mobile number"
                  icon={Phone}
                  error={error("mobileNumber")}
                  success={valid("mobileNumber")}
                  hint={`${form.mobileNumber.length}/10 digits`}
                >
                  <input
                    ref={
                      submitted &&
                      !errors.fullName &&
                      errors.mobileNumber
                        ? errorRef
                        : null
                    }
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobileNumber}
                    maxLength={10}
                    aria-invalid={Boolean(error("mobileNumber"))}
                    onChange={(e) =>
                      change(
                        "mobileNumber",
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    onBlur={() => touch("mobileNumber")}
                  />
                </Field>

                <Field
                  id="email"
                  label="Email address"
                  icon={Mail}
                  error={error("email")}
                  success={valid("email")}
                  hint={
                    valid("email")
                      ? `We'll use ${email}`
                      : "We'll use this to identify your account."
                  }
                >
                  <input
                    ref={
                      submitted &&
                      !errors.fullName &&
                      !errors.mobileNumber &&
                      errors.email
                        ? errorRef
                        : null
                    }
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    aria-invalid={Boolean(error("email"))}
                    onChange={(e) => change("email", e.target.value)}
                    onBlur={() => {
                      touch("email");
                      if (form.email) {
                        change(
                          "email",
                          form.email.trim().toLowerCase()
                        );
                      }
                    }}
                  />
                </Field>

                <Field
                  id="password"
                  label="Password"
                  icon={LockKeyhole}
                  error={error("password")}
                  success={valid("password")}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={form.password}
                    aria-invalid={Boolean(error("password"))}
                    aria-describedby="password-requirements"
                    onChange={(e) =>
                      change("password", e.target.value)
                    }
                    onBlur={() => touch("password")}
                  />

                  <button
                    className="icon-button input-action"
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </Field>

                <div
                  className="strength-block"
                  id="password-requirements"
                >
                  <div className="strength-top">
                    <span>Password strength</span>
                    <strong
                      className={`strength-label ${strength.level}`}
                    >
                      {strength.label}
                    </strong>
                  </div>

                  <div
                    className={`strength-meter ${strength.level}`}
                    aria-label={`Password strength: ${strength.label}`}
                  >
                    {[1, 2, 3, 4, 5].map((number) => (
                      <span
                        key={number}
                        className={
                          number <= strength.score ? "filled" : ""
                        }
                      />
                    ))}
                  </div>

                  <div className="password-checks">
                    {checks.map((check) => (
                      <span
                        key={check.label}
                        className={
                          check.ok ? "check-passed" : ""
                        }
                      >
                        <CheckCircle2 size={13} />
                        {check.label}
                      </span>
                    ))}
                  </div>
                </div>

                <Field
                  id="confirmPassword"
                  label="Confirm password"
                  icon={LockKeyhole}
                  error={error("confirmPassword")}
                  success={valid("confirmPassword")}
                >
                  <input
                    ref={
                      submitted &&
                      !errors.fullName &&
                      !errors.mobileNumber &&
                      !errors.email &&
                      !errors.password &&
                      errors.confirmPassword
                        ? errorRef
                        : null
                    }
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    aria-invalid={Boolean(error("confirmPassword"))}
                    onChange={(e) =>
                      change("confirmPassword", e.target.value)
                    }
                    onBlur={() => touch("confirmPassword")}
                  />

                  <button
                    className="icon-button input-action"
                    type="button"
                    onClick={() =>
                      setShowConfirm((value) => !value)
                    }
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </Field>

                <div
                  className={`terms-row ${
                    error("termsAccepted") ? "terms-error" : ""
                  }`}
                >
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) =>
                      change("termsAccepted", e.target.checked)
                    }
                    onBlur={() => touch("termsAccepted")}
                    aria-invalid={Boolean(error("termsAccepted"))}
                  />

                  <label htmlFor="termsAccepted">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-link"
                      onClick={() =>
                        window.alert(
                          "Demo Terms & Conditions: use this form for testing only. Do not enter real passwords or personal information."
                        )
                      }
                    >
                      Terms &amp; Conditions
                    </button>{" "}
                    and Privacy Policy.
                  </label>
                </div>

                {error("termsAccepted") && (
                  <p
                    className="field-message error-message terms-message"
                    role="alert"
                  >
                    {error("termsAccepted")}
                  </p>
                )}

                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Registering… <span className="spinner" />
                      </>
                    ) : (
                      <>
                        Create account <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={reset}
                  >
                    <RotateCcw size={15} />
                    Reset
                  </button>
                </div>

                <p className="demo-note">
                  <ShieldCheck size={14} />
                  Demo only. Do not enter real passwords.
                </p>
              </form>
            </>
          )}

          {screen === "otp" && (
            <div className="state-screen">
              <span className="state-icon">
                <ShieldCheck size={30} />
              </span>

              <span className="step-label">STEP 2 OF 2</span>
              <h2>Verify your number</h2>

              <p className="state-description">
                Enter the 6-digit demo code to complete registration.
              </p>

              <div className="masked-number">
                <Phone size={16} />
                +91 ••••••{form.mobileNumber.slice(-4)}
              </div>

              <form onSubmit={verify}>
                <div className="otp-inputs" aria-label="Six digit OTP">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        otpRefs.current[index] = node;
                      }}
                      aria-label={`OTP digit ${index + 1}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete={
                        index === 0 ? "one-time-code" : "off"
                      }
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        changeOtp(index, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !otp[index] &&
                          index > 0
                        ) {
                          otpRefs.current[index - 1]?.focus();
                        }

                        if (e.key === "ArrowLeft" && index > 0) {
                          otpRefs.current[index - 1]?.focus();
                        }

                        if (
                          e.key === "ArrowRight" &&
                          index < 5
                        ) {
                          otpRefs.current[index + 1]?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();

                        const digits = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6)
                          .split("");

                        setOtp((old) =>
                          old.map((value, i) => digits[i] || "")
                        );

                        otpRefs.current[
                          Math.min(digits.length, 5)
                        ]?.focus();
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="field-message error-message" role="alert">
                    {otpError}
                  </p>
                )}

                <p className="demo-otp">
                  Demo OTP: <strong>123456</strong>
                </p>

                <button
                  className="primary-button full-width"
                  type="submit"
                >
                  Verify &amp; continue <ArrowRight size={17} />
                </button>
              </form>

              <button
                className="text-button"
                type="button"
                disabled={seconds > 0}
                onClick={() => {
                  setSeconds(45);
                  setOtpError("Demo OTP resent. Use 123456.");
                }}
              >
                {seconds > 0
                  ? `Resend code in 00:${String(seconds).padStart(2, "0")}`
                  : "Resend OTP"}
              </button>

              <button
                className="back-link"
                type="button"
                onClick={() => setScreen("register")}
              >
                ← Back to registration
              </button>
            </div>
          )}

          {screen === "success" && (
            <div className="state-screen success-screen">
              <span className="success-badge">
                <CheckCircle2 size={43} />
              </span>

              <span className="step-label success-step">
                REGISTRATION COMPLETE
              </span>

              <h2>You’re all set!</h2>

              <p className="state-description">
                Your demo registration has been verified successfully.
              </p>

              <div className="profile-summary">
                <div className="profile-avatar">
                  {form.fullName.trim().charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{form.fullName.trim()}</strong>
                  <span>{email}</span>
                  <small>+91 {form.mobileNumber}</small>
                </div>
              </div>

              <div className="success-info">
                <CheckCircle2 size={17} />
                All form validations passed.
              </div>

              <button
                className="primary-button full-width"
                type="button"
                onClick={reset}
              >
                Back to registration <ArrowRight size={17} />
              </button>

              <p className="demo-note">
                <ShieldCheck size={14} />
                Demo flow only. No account was created on a server.
              </p>
            </div>
          )}
        </section>
      </section>

      <footer className="page-footer">
        © {new Date().getFullYear()} ShowPass · Customer Registration
        &amp; Login Modules
      </footer>
    </main>
  );
}
