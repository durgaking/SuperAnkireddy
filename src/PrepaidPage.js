// PrepaidPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdSettings,
  MdMenu,
  MdAccountCircle,
  MdLock,
  MdVerifiedUser,
  MdExitToApp,
  MdHome,
  MdReceipt,
  MdCreditCard,
  MdPerson,
  MdKeyboardArrowDown,
  MdSignalCellular4Bar,
  MdNetworkCell,
  MdNetworkWifi,
  MdPhoneAndroid,
  MdHistory,
  MdCheckCircle
} from "react-icons/md";

const PrepaidPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recharge");
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleOperator = () => setOperatorOpen(prev => !prev);

  const operators = [
    { name: "Jio", icon: MdSignalCellular4Bar, color: "#e53935" },
    { name: "Airtel", icon: MdNetworkCell, color: "#d32f2f" },
    { name: "BSNL", icon: MdPhoneAndroid, color: "#1e88e5" },
    { name: "Vodafone Idea", icon: MdNetworkWifi, color: "#c2185b" }
  ];

  const history = [
    { id: 1, number: "9876543210", operator: "Jio", amount: "₹149", date: "Oct 25, 2025", status: "Success" },
    { id: 2, number: "9123456789", operator: "Airtel", amount: "₹299", date: "Oct 20, 2025", status: "Success" },
    { id: 3, number: "9988776655", operator: "Vodafone", amount: "₹99", date: "Oct 18, 2025", status: "Pending" }
  ];

  const handleRecharge = () => {
    if (!selectedOperator) {
      alert("Please select an operator");
      return;
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    alert(`Recharging ${mobileNumber} on ${selectedOperator}`);
    setMobileNumber("");
    setSelectedOperator("");
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: "#f5f4fa", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #6f3fc6, #9550db)",
          color: "#fff",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          zIndex: 10,
          boxShadow: "0 8px 20px rgba(111, 63, 198, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px", gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            <MdArrowBack size={28} />
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, flex: 1 }}>Super 25</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MdSettings size={24} style={{ cursor: "pointer" }} />
            <button
              onClick={toggleMenu}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <MdMenu size={28} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: 70,
              right: 16,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              minWidth: 220,
              zIndex: 1000
            }}
          >
            {[
              { label: "Profile", icon: MdAccountCircle },
              { label: "Change Password", icon: MdLock },
              { label: "KYC", icon: MdVerifiedUser },
              { label: "Logout", icon: MdExitToApp }
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  console.log(`${item.label} clicked`);
                  setMenuOpen(false);
                }}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#533a7b",
                  cursor: "pointer"
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

        <div style={{ textAlign: "center", margin: "10px 0 20px", fontSize: 20, fontWeight: 700 }}>
          Prepaid Mobile Services
        </div>
      </header>

      {/* Main Card with Tabs */}
      <section
        style={{
          background: "#fff",
          margin: "20px 16px",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          zIndex: 1
        }}
      >
        {/* Help Text */}
        <div
          style={{
            background: "#e9e2f7",
            color: "#533a7b",
            padding: "12px 0",
            fontSize: 15,
            textAlign: "center",
            fontWeight: 600
          }}
        >
          JO : 9996-436055 WE ARE HAPPY TO HELP YOU
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setActiveTab("recharge")}
            style={{
              flex: 1,
              padding: "14px",
              background: activeTab === "recharge" ? "#6f3fc6" : "transparent",
              color: activeTab === "recharge" ? "#fff" : "#533a7b",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: "12px 0 0 0",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Recharge
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              flex: 1,
              padding: "14px",
              background: activeTab === "history" ? "#6f3fc6" : "transparent",
              color: activeTab === "history" ? "#fff" : "#533a7b",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: "0 12px 0 0",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <MdHistory size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: "24px 20px" }}>
          {activeTab === "recharge" ? (
            <>
              {/* 1. Select Operator */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <button
                  onClick={toggleOperator}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#fff8f0",
                    border: "1px solid #ffcc80",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#333",
                    cursor: "pointer"
                  }}
                >
                  <span>{selectedOperator || "Select Operator"}</span>
                  <MdKeyboardArrowDown size={24} color="#e53935" />
                </button>

                {operatorOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ffcc80",
                      borderRadius: 16,
                      marginTop: 8,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      zIndex: 100
                    }}
                  >
                    {operators.map((op, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedOperator(op.name);
                          setOperatorOpen(false);
                        }}
                        style={{
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fff8e1"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        <op.icon size={22} color={op.color} />
                        <span style={{ fontWeight: 500 }}>{op.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Mobile Number */}
              <input
                type="text"
                placeholder="Enter 10-digit Mobile Number"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: 20,
                  borderRadius: 16,
                  border: "1px solid #ddd",
                  fontSize: 16,
                  background: "#fafafa"
                }}
              />

              {/* 3. Recharge Button */}
              <button
                onClick={handleRecharge}
                style={{
                  width: "100%",
                  padding: 16,
                  background: "#6f3fc6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(111, 63, 198, 0.3)"
                }}
              >
                Recharge
              </button>
            </>
          ) : (
            /* Mobile History Tab */
            <div>
              {history.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999", fontStyle: "italic" }}>
                  No recharge history yet.
                </p>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: "14px 16px",
                      background: "#f8f5ff",
                      borderRadius: 16,
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#333" }}>{item.number}</div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {item.operator} • {item.amount} • {item.date}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MdCheckCircle
                        size={18}
                        color={item.status === "Success" ? "#4caf50" : "#ff9800"}
                      />
                      <span style={{ fontSize: 13, fontWeight: 500, color: item.status === "Success" ? "#4caf50" : "#ff9800" }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Navigation */}
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
        <BottomNavItem icon={MdHome} label="Meeting" />
        <BottomNavItem icon={MdReceipt} label="Statement" />
        <BottomNavItem icon={MdCreditCard} label="Monetization" />
        <BottomNavItem icon={MdPerson} label="Portfolio" active />
      </nav>
    </div>
  );
};

function BottomNavItem({ icon: Icon, label, active }) {
  return (
    <div style={{ textAlign: "center", color: active ? "#9550db" : "#666" }}>
      <Icon size={26} />
      <div style={{ fontSize: 12, marginTop: 4, fontWeight: active ? 600 : 500 }}>{label}</div>
    </div>
  );
}

export default PrepaidPage;