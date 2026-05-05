import { User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3AuthDisconnect } from "@web3auth/modal/react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { disconnect } = useWeb3AuthDisconnect();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  async function handleLogout() {
    try {
      await disconnect();
    } catch (err) {
      console.error(err);
    }

    logout();
    navigate("/login");
  }

  if (isAuthPage) return null;

  return (
    <div style={styles.container}>
      <button style={styles.iconBtn} onClick={() => navigate("/home")}>
        <User size={24} />
      </button>

      <button style={styles.iconBtn} onClick={handleLogout}>
        <LogOut size={24} />
      </button>
    </div>
  );
}




const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: "20px",
    left: "0",
    right: "0",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 30px",
    zIndex: 99999,
    pointerEvents: "auto", 
  },
  left: {
    color: "#fff",
    pointerEvents: "auto",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#fff",
    pointerEvents: "auto",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "inherit",
  },
};