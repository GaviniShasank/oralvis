import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "./api";

function Signup() {
  const navigate = useNavigate();

  // state for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Normal signup
  const handleSignup = async () => {
    try {
      const { data } = await api.post("/signup", {
        email,
        password,
        confirmPassword,
      });

      localStorage.setItem("token", data.token);
      alert("Account created successfully!");
      navigate("/patientdashboard");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  // Google signup
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // get Google profile
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = await res.json();

        // send profile to backend
        const { data } = await api.post("/google-auth", {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        });

        localStorage.setItem("token", data.token);
        alert("Google signup successful!");
        navigate("/patientdashboard");
      } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);
        alert("Google login failed");
      }
    },
    onError: () => {
      console.log("Google login failed");
    },
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
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
          color: "#333333",
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          style={{ fontWeight: "bold" }}
        >
          Create Account
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Password Requirements:
        </Typography>
        <ul style={{ fontSize: "14px", marginBottom: "20px" }}>
          <li>An uppercase character</li>
          <li>A numeric character</li>
          <li>An alphabetic character</li>
          <li>A minimum of 8 characters</li>
          <li>A lowercase character</li>
          <li>A special character</li>
        </ul>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            id="email"
            label="Email Address"
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
          <TextField
            id="confirmPassword"
            label="Verify New Password"
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
            onClick={handleSignup}
          >
            Create Account
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              my: 2,
              position: "relative",
            }}
          >
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
            <Typography
              sx={{
                mx: 2,
                color: "#555",
                fontWeight: "600",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              OR
            </Typography>
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
          </Box>

          <Button
            variant="outlined"
            size="large"
            sx={{
              mt: 1,
              borderColor: "#4285F4",
              color: "#4285F4",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "none",
              padding: "10px 15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: "#f1f1f1",
                borderColor: "#4285F4",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
            onClick={handleGoogleSignup}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 533.5 544.3"
              width="20"
              height="20"
              style={{ marginRight: "10px" }}
            >
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.5-34.2-4.4-50.4H272v95.4h146.7c-6.3 33.9-25 62.7-53.3 82v68h86.1c50.3-46.3 79-114.8 79-195z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.7 0 133.7-24.1 178.3-65.3l-86.1-68c-23.9 16-54.3 25.5-92.2 25.5-70.9 0-131-47.9-152.4-112.3h-89.4v70.6c44.7 87.7 136.7 149.5 242 149.5z"
              />
              <path
                fill="#FBBC05"
                d="M119.4 329.1c-10.5-31.5-10.5-65.7 0-97.2v-70.6h-89.4c-37.6 73.2-37.6 159.1 0 232.3l89.4-64.5z"
              />
              <path
                fill="#EA4335"
                d="M272 107.4c38.3 0 72.6 13.2 99.6 39.2l74.7-74.7C404.7 24.1 343.7 0 272 0 166.7 0 74.7 61.8 30 149.5l89.4 70.6c21.4-64.4 81.5-112.7 152.6-112.7z"
              />
            </svg>
            Continue with Google
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default Signup;
