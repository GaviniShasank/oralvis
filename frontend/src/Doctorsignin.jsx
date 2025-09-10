import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "./api"; // ✅ axios instance with baseURL=http://localhost:3000

function DoctorSignin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/login", { email, password });

      // Save token & role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        navigate("/doctordashboard"); // ✅ doctor goes to admin dashboard
      } else {
        alert("You are not authorized as a doctor!");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgotpassword");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            width: 400,
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            textAlign: "center",
            color: "#333333",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Doctor Login
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Typography
              sx={{
                textAlign: "right",
                fontSize: "0.9rem",
                color: "#1976d2",
                fontWeight: "500",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default DoctorSignin;
