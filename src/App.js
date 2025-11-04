import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import {
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdPhone,
  MdTv,
  MdCreditCard,
  MdLightbulb,
  MdDescription,
  MdDirectionsCar,
  MdLocalGasStation,
  MdLocalFireDepartment,
  MdSecurity,
  MdWifi,
  MdSportsEsports,
  MdMail,
  MdAdd,
  MdArrowUpward,
  MdReceipt,
  MdQrCodeScanner,
  MdHome,
  MdPerson as MdPersonNav,
  MdSettings,
  MdMenu,
  MdAccountCircle,
  MdLock as MdLockNav,
  MdVerifiedUser,
  MdExitToApp,
  MdStar,
  MdAccountTree // Added for TreePage
} from "react-icons/md";
import ApiService from './services/api';
import PrepaidPage from "./PrepaidPage";

const walletInfo = [
  { label: "Recharge Wallet", amount: "₹ 50,000", icon: MdAdd },
  { label: "Utility Wallet", amount: "723,800", icon: MdCreditCard },
  { label: "Utility Point", amount: "1,100,000", icon: MdStar },
  { label: "Utility Point", amount: "725,000", icon: MdStar }
];

const services = [
  { name: "Prepaid", icon: MdPhone, path: "/prepaid" },
  { name: "DTH", icon: MdTv },
  { name: "Postpaid", icon: MdPhone },
  { name: "Electricity", icon: MdLightbulb },
  { name: "SIP PLAN", icon: MdDescription },
  { name: "FASTag", icon: MdDirectionsCar },
  { name: "Book A Cylinder", icon: MdLocalGasStation },
  { name: "Piped Gas", icon: MdLocalFireDepartment },
  { name: "LIC Insurance", icon: MdSecurity },
  { name: "Broadband", icon: MdWifi },
  { name: "Google Play Recharge", icon: MdSportsEsports },
  { name: "Digital Mail", icon: MdMail },
  { name: "Tree", icon: MdAccountTree, path: "/tree" } // Added Tree service
];

// === Login Page ===
function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await ApiService.login({
        userId,
        password
      });

      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d8cc1 0%, #0a6fa3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 80,
            height: 80,
            background: "#ff9800",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 6px 15px rgba(255, 152, 0, 0.3)"
          }}
        >
          <span style={{ color: "#fff", fontSize: 42, fontWeight: 700 }}>S</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 700, margin: 0 }}>Super Pay</h1>
        <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 500, margin: "8px 0 0" }}>Log In</h2>
      </div>

      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <MdPerson size={24} color="#666" style={{ marginRight: 12 }} />
          <div style={{ width: 1, height: 32, background: "#ddd", marginRight: 12 }} />
          <input
            type="text"
            placeholder="USER ID, EMAIL OR MOBILE"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              flex: 1,
              padding: "16px 0",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "#333"
            }}
          />
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <MdLock size={24} color="#666" style={{ marginRight: 12 }} />
          <div style={{ width: 1, height: 32, background: "#ddd", marginRight: 12 }} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: 1,
              padding: "16px 0",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "#333"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            <span>{showPassword ? "Hide" : "Show"}</span>
          </button>
        </div>

        {error && (
          <p style={{ 
            color: "#ff5252", 
            fontSize: 14, 
            textAlign: "center", 
            margin: "0 0 12px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "10px",
            borderRadius: "8px"
          }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", margin: "0 0 24px" }}>
          <span
            onClick={() => navigate("/forgot")}
            style={{ color: "#fff", fontSize: 15, cursor: "pointer" }}
          >
            Forgot Password?
          </span>
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "#fff", fontSize: 15, cursor: "pointer" }}
          >
            Sign Up
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            background: loading ? "#ccc" : "#ff9800",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)",
            textTransform: "uppercase"
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// === Forgot Password Page ===
function ForgotPasswordPage() {
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mobile.length === 10) {
      setMessage("OTP sent to your mobile!");
    } else {
      setMessage("Enter valid 10-digit mobile");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d8cc1 0%, #0a6fa3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>Forgot Password?</h1>
        <p style={{ color: "#ddd", fontSize: 16 }}>Enter your mobile to reset</p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            marginBottom: 16
          }}
        >
          <MdPhone size={24} color="#666" style={{ marginRight: 12 }} />
          <div style={{ width: 1, height: 32, background: "#ddd", marginRight: 12 }} />
          <input
            type="text"
            placeholder="MOBILE NUMBER"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            style={{
              flex: 1,
              padding: "16px 0",
              border: "none",
              outline: "none",
              fontSize: 16
            }}
          />
        </div>

        {message && (
          <p style={{ 
            color: message.includes("sent") ? "#4caf50" : "#ff5252", 
            textAlign: "center", 
            margin: "0 0 16px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "10px",
            borderRadius: "8px"
          }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 16,
            background: "#ff9800",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Send OTP
        </button>

        <p
          onClick={() => navigate("/")}
          style={{ 
            textAlign: "center", 
            color: "#fff", 
            marginTop: 20, 
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Back to Login
        </p>
      </form>
    </div>
  );
}

// === Signup Page ===
function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralId, setReferralId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!fullName || fullName.length < 3) {
      setError("Full name must be at least 3 characters long");
      setLoading(false);
      return;
    }

    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (mobile.length !== 10) {
      setError("Enter valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await ApiService.signup({
        fullName,
        email,
        mobile,
        password,
        referralId: referralId || null
      });

      if (result.success) {
        alert(`Signup successful! Your User ID is: ${result.user.userId}. Please login with your credentials.`);
        setFullName("");
        setEmail("");
        setMobile("");
        setPassword("");
        setConfirmPassword("");
        setReferralId("");
        navigate("/");
      }
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d8cc1 0%, #0a6fa3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>Create Account</h1>
      </div>

      <form onSubmit={handleSignup} style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdPerson size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="text"
            placeholder="FULL NAME"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdMail size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdPhone size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="text"
            placeholder="MOBILE NUMBER"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdLock size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdLock size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="password"
            placeholder="CONFIRM PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: "0 16px", 
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <MdPerson size={20} color="#666" style={{ marginRight: 12 }} />
          <input
            type="text"
            placeholder="REFERRAL ID (Optional)"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value.toUpperCase())}
            style={{ 
              width: "100%", 
              padding: "16px 0", 
              border: "none", 
              outline: "none", 
              fontSize: 16 
            }}
          />
        </div>

        {error && (
          <p style={{ 
            color: "#ff5252", 
            textAlign: "center", 
            margin: "0 0 16px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "14px"
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            background: loading ? "#ccc" : "#ff9800",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p
          onClick={() => navigate("/")}
          style={{ 
            textAlign: "center", 
            color: "#fff", 
            marginTop: 20, 
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}

// === Dashboard ===
function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [referralCount, setReferralCount] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      ApiService.getReferralStats(parsedUser.userId)
        .then(data => {
          if (data.success) {
            setReferralCount(data.referralStats.totalReferrals);
            setUser(prev => ({ ...prev, totalEarning: data.referralStats.totalEarning }));
            localStorage.setItem('user', JSON.stringify({
              ...parsedUser,
              totalEarning: data.referralStats.totalEarning
            }));
          } else {
            setError(data.message || "Failed to fetch referral stats");
          }
        })
        .catch(error => {
          console.error('Error fetching referral stats:', error);
          setError("Unable to fetch referral stats");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.setItem('isLoggedIn', 'false');
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: "#f5f4fa", minHeight: "100vh" }}>
      <header
        style={{
          background: "linear-gradient(135deg, #6f3fc6, #9550db)",
          color: "#fff",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 20px rgba(111, 63, 198, 0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Super Pay</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MdSettings size={24} />
            <button
              onClick={toggleMenu}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <MdMenu size={28} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 70,
              right: 16,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              minWidth: 200,
              zIndex: 100,
              overflow: "hidden"
            }}
          >
            {[
              { label: "Profile", icon: MdAccountCircle },
              { label: "Change Password", icon: MdLockNav },
              { label: "KYC", icon: MdVerifiedUser },
              { label: "Logout", icon: MdExitToApp }
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  if (item.label === "Logout") {
                    handleLogout();
                  }
                  setMenuOpen(false);
                }}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#533a7b",
                  cursor: "pointer",
                  borderBottom: i < 3 ? "1px solid #eee" : "none"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8f5ff"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <item.icon size={20} color="#6f3fc6" />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", padding: "20px 16px" }}>
          <img
            src="https://i.ibb.co/9vqDf92/avatar-user.png"
            alt="profile"
            style={{
              borderRadius: "50%",
              width: 64,
              height: 64,
              border: "3px solid #fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />
          <div style={{ marginLeft: 16, flex: 1 }}>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Good Afternoon <span style={{ fontSize: 18 }}>{user?.fullName || 'User'}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.fullName?.toUpperCase() || 'USER'}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{user?.userId || 'EP20003'}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Total Earning</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>
              ₹{user?.totalEarning ? user.totalEarning.toLocaleString() : '401,300'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
              Referrals: {referralCount}
            </div>
            {error && (
              <div style={{ fontSize: 12, color: "#ff5252", marginTop: 4 }}>
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            margin: "0 16px 24px",
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(187, 178, 238, 0.3)"
          }}
        >
          <ActionButton icon={MdAdd} label="Add Balance" />
          <ActionButton icon={MdArrowUpward} label="Transfer" divider />
          <ActionButton icon={MdReceipt} label="Passbook" divider />
          <ActionButton icon={MdQrCodeScanner} label="Scan & Pay" divider />
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 16px 20px", overflowX: "auto" }}>
          {walletInfo.map((item, i) => (
            <div
              key={i}
              style={{
                background: i < 2 ? "rgba(255,255,255,0.15)" : "#e9e2f7",
                borderRadius: 16,
                minWidth: 110,
                padding: "12px 8px",
                textAlign: "center",
                backdropFilter: "blur(10px)",
                border: i >= 2 ? "1px solid #ddd" : "none"
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: i < 2 ? "#fff" : "#333" }}>
                {item.amount}
              </div>
              <div style={{ fontSize: 12, color: i < 2 ? "#fff" : "#533a7b", marginTop: 4, fontWeight: 500 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <section
        style={{
          background: "#fff",
          margin: "20px 16px",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
        }}
      >
        <div
          style={{
            background: "#e9e2f7",
            color: "#533a7b",
            padding: "10px 0",
            fontSize: 15,
            textAlign: "center",
            fontWeight: 600
          }}
        >
          JO : 9996-436055 WE ARE HAPPY TO HELP YOU
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            padding: "24px 12px"
          }}
        >
          {services.map((item, idx) => (
            <div
              key={idx}
              style={{
                textAlign: "center",
                cursor: item.path ? "pointer" : "default",
                transition: "transform 0.2s"
              }}
              onClick={() => item.path && navigate(item.path)}
              onMouseEnter={e => item.path && (e.currentTarget.style.transform = "translateY(-6px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: "#0c69e4",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  boxShadow: "0 4px 12px rgba(12, 105, 228, 0.3)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => item.path && (e.currentTarget.style.background = "#0a58ca")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0c69e4")}
              >
                <item.icon size={28} color="#fff" />
              </div>
              <div style={{ color: "#533a7b", fontSize: 13, fontWeight: 600 }}>
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "12px 0",
            color: "#9550db",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer"
          }}
        >
          View More
        </div>
      </section>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #eee",
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          zIndex: 100
        }}
      >
        <BottomNavItem icon={MdHome} label="Meeting" active />
        <BottomNavItem icon={MdReceipt} label="Statement" />
        <BottomNavItem icon={MdCreditCard} label="Monetization" />
        <BottomNavItem icon={MdPersonNav} label="Portfolio" />
      </nav>
    </div>
  );
}

// === Tree Page ===
function TreePage() {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const result = await ApiService.getTree();
        if (result.success) {
          setTreeData(result.tree);
        } else {
          setError(result.message || "Failed to fetch tree");
        }
      } catch (err) {
        setError(err.message || "Error loading tree");
      } finally {
        setLoading(false);
      }
    };

    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate("/");
      return;
    }

    fetchTree();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4fa" }}>
        <div>Loading Tree...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4fa" }}>
        <div style={{ color: "#ff5252", textAlign: "center" }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: "#f5f4fa", minHeight: "100vh", padding: "20px" }}>
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#6f3fc6", fontSize: "28px", margin: "0" }}>Referral Tree Structure</h1>
        <p style={{ color: "#666", fontSize: "16px" }}>Hierarchical view of users based on referrals</p>
      </header>

      <div style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", maxHeight: "80vh", overflowY: "auto" }}>
        {treeData.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            No referral tree data available.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {treeData.map((node, index) => (
              <li
                key={node.id}
                style={{
                  padding: "12px 20px",
                  borderBottom: index < treeData.length - 1 ? "1px solid #eee" : "none",
                  paddingLeft: `${node.level * 20 + 20}px`,
                  fontSize: "14px",
                  color: "#333",
                  position: "relative"
                }}
              >
                {node.level > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${node.level * 20}px`,
                      top: "50%",
                      width: "1px",
                      height: "100%",
                      background: "#ddd",
                      transform: "translateY(100%)"
                    }}
                  />
                )}
                <strong>{node.user_id}</strong> - {node.full_name}
                <br />
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Email: {node.email} | Mobile: {node.mobile} | Level: {node.level}
                </small>
                {node.path && <br />}
                <small style={{ color: "#9550db", fontSize: "11px" }}>Path: {node.path}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          background: "#6f3fc6",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(111, 63, 198, 0.3)"
        }}
      >
        ←
      </button>
    </div>
  );
}

// === Reusable Components ===
function ActionButton({ icon: Icon, label, divider }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "16px 0",
        borderLeft: divider ? "1px solid #eee" : "none"
      }}
    >
      <Icon size={24} color="#6f3fc6" />
      <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600, color: "#333" }}>{label}</div>
    </div>
  );
}

function BottomNavItem({ icon: Icon, label, active }) {
  return (
    <div style={{ textAlign: "center", color: active ? "#9550db" : "#666", cursor: "pointer" }}>
      <Icon size={26} />
      <div style={{ fontSize: 12, marginTop: 4, fontWeight: active ? 600 : 500 }}>{label}</div>
    </div>
  );
}

// === App Router ===
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prepaid" element={<PrepaidPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tree" element={<TreePage />} />
      </Routes>
    </Router>
  );
}