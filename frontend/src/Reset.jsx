import { Button, TextField, Typography, Box } from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      alert("Password reset successful");
      navigate("/signin");
    } catch (err) {
      alert(err.response?.data?.msg || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url("/src/assets/background.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold" }}>
          Reset Password
        </Typography>

        <Typography variant="body2" gutterBottom sx={{ mb: 2, color: "#555" }}>
          Enter the OTP sent to your email and set your new password.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
             id="otp"
            label="OTP"
            variant="outlined"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <TextField
            id="newPassword"
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            id="confirmPassword"
            label="Re-enter New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            sx={{ mt: 1 }}
            onClick={handleReset}
          >
            Reset Password
          </Button>

          <Button
            variant="text"
            size="small"
            sx={{ color: "#1976d2", mt: 1 }}
            onClick={() => navigate("/signin")}
          >
            Back to Login
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default ResetPassword;