import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Appbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ clear auth token
    localStorage.removeItem("role");  // optional if you store role
    navigate("/"); // ✅ redirect to login page
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px", // Fixed height
        padding: "0 50px", // Horizontal padding only
        backgroundColor: "#f5f7fa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Clickable Text Logo */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "#002F6C",
          cursor: "pointer",
          "&:hover": { color: "#F58220" },
        }}
        onClick={() => navigate("/doctordashboard")}
      >
        Oral<span style={{ color: "#F58220" }}>Vis</span>
      </Typography>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "15px", height: "100%", alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={() => navigate("/doctordashboard")}
          sx={{
            backgroundColor: "#002F6C",
            "&:hover": { backgroundColor: "#001f4d" },
            fontWeight: "600",
            height: "40px", // Consistent button height
          }}
        >
          Dashboard
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/review")}
          sx={{
            backgroundColor: "#F58220",
            "&:hover": { backgroundColor: "#e46f14" },
            fontWeight: "600",
            height: "40px",
          }}
        >
          Review
        </Button>

        {/* ✅ Logout Button */}
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderColor: "#d32f2f",
            color: "#d32f2f",
            fontWeight: "600",
            height: "40px",
            "&:hover": {
              backgroundColor: "#ffebee",
              borderColor: "#b71c1c",
              color: "#b71c1c",
            },
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Appbar;
