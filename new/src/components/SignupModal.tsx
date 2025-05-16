import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { signupUser, setTokenInLocalStorage, loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({
  open,
  onClose,
  onOpenLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address");
      isValid = false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoadingSignup(true);
    try {
      await signupUser(email, password);
      const token = await loginUser(email, password);
      setTokenInLocalStorage(token);
      navigate("/chat");
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoadingSignup(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Box
          bgcolor="background.paper"
          p={4}
          borderRadius={2}
          boxShadow={3}
          maxWidth={400}
          width="100%"
        >
          <Typography variant="h5" mb={2} textAlign="center">
            Sign Up
          </Typography>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            error={!!emailError}
            helperText={emailError}
            disabled={loadingSignup}
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            required
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validate}
            error={!!passwordError}
            helperText={passwordError}
            disabled={loadingSignup}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPw(!showPw)}
                    disabled={loadingSignup}
                  >
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            margin="normal"
            required
            type={showConfirmPw ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validate}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            disabled={loadingSignup}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    disabled={loadingSignup}
                  >
                    {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignup}
            sx={{ mt: 2 }}
            disabled={
              loadingSignup ||
              email.trim() === "" ||
              password.trim() === "" ||
              confirmPassword.trim() === ""
            }
          >
            {loadingSignup ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account?{" "}
              <Button onClick={onOpenLogin} color="primary">
                Login
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default SignupModal;