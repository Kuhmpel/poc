import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { loginUser, setTokenInLocalStorage } from "../services/api";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoadingLogin(true);
    try {
      const token = await loginUser(email, password);
      setTokenInLocalStorage(token);
      navigate("/chat");
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <Box
      display="flex"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ background: "linear-gradient(to right, #00c6ff, #0072ff)" }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" mb={2} textAlign="center">
          Login
        </Typography>
        <Typography variant="body2" mb={2} textAlign="center">
          Login to save your chat history and continue as a registered user.
        </Typography>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loadingLogin}
        />
        <TextField
          fullWidth
          label="Password"
          margin="normal"
          required
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loadingLogin}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPw((prev) => !prev)}
                  disabled={loadingLogin}
                >
                  {showPw ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 2 }}
          disabled={
            loadingLogin || email.trim() === "" || password.trim() === ""
          }
        >
          {loadingLogin ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Login"
          )}
        </Button>
        <Box mt={2}>
          <Typography variant="body2">
            Don&apos;t have an account?{" "}
            <Button onClick={() => navigate("/signup")} color="primary">
              Sign Up
            </Button>
          </Typography>
          <Typography variant="body2">
            Don&apos;t want to login?{" "}
            <Button sx={{ color: "green" }} onClick={() => navigate("/chat")}>
              Continue as Guest
            </Button>
          </Typography>
          <Typography variant="body2">
            Forgot your password?{" "}
            <Button
              sx={{ color: "red" }}
              onClick={() => navigate("/forgot-password")}
            >
              Reset Password
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;