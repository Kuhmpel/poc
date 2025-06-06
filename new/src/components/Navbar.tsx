import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Box,
  Link,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCommentIcon from "@mui/icons-material/AddComment";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

import {
  createNewConversation,
  searchConversations,
  isAuthenticated,
  validateToken,
  clearTokenFromLocalStorage,
} from "../services/api";
import { IConversation } from "../types/conversation";

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefreshConversations: () => void;
  onSelectConversation: (id: string | null) => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
}

const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onRefreshConversations,
  onSelectConversation,
  onToggleTheme,
  darkMode,
  setConversations,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [newConvLoading, setNewConvLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(isAuthenticated());
  const debounceTimerRef = useRef<number | null>(null);
  const hasReloadedRef = useRef(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Always check for access_token (not token)
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsTokenValid(false);
      return;
    }

    const interval = setInterval(async () => {
      const valid = await validateToken();
      if (!valid && !hasReloadedRef.current) {
        hasReloadedRef.current = true;
        console.warn("Token invalid, reloading app...");
        window.location.reload();
      }
      setIsTokenValid(valid);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const debouncedSearch = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(async () => {
      if (!value.trim()) {
        onRefreshConversations();
        setSearchLoading(false);
        return;
      }
      try {
        const results = await searchConversations(value);
        setConversations(results);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchLoading(true);
    debouncedSearch(value);
  };

  const handleCreateNewConversation = async () => {
    setNewConvLoading(true);
    localStorage.removeItem("guestConversationId");

    try {
      const newConv = await createNewConversation();
      onRefreshConversations();
      onSelectConversation(newConv._id);
    } catch (error: any) {
      onSelectConversation(null);
      onRefreshConversations();
      if (error.response?.status === 401) {
        console.warn("User is not authenticated, clearing conversation in UI only.");
      } else {
        console.error(error);
      }
      if (!hasReloadedRef.current) {
        hasReloadedRef.current = true;
        window.location.reload();
      }
    } finally {
      setNewConvLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokenFromLocalStorage();
    setIsTokenValid(false);
    navigate("/login");
  };

  const handleToggleTheme = () => {
    onToggleTheme();
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  return (
    <>
      <AppBar position="static" sx={{ transition: "all 0.3s" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            boxShadow: "0px 1px 5px 0px rgba(0,0,0,0.2)",
          }}
        >
          <Box display="flex" alignItems="center" flex="1">
            <IconButton color="inherit" onClick={onToggleSidebar} edge="start" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>

            <IconButton color="inherit" onClick={handleToggleTheme} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: darkMode ? "grey.800" : "white",
                color: "black",
                borderRadius: 1,
                padding: 1,
                flex: 1,
                transition: "all 0.3s",
                boxShadow: "0px 1px 5px 0px rgba(0,0,0,0.2)",
              }}
            >
              <SearchIcon sx={{ color: darkMode ? "grey.200" : "grey.700", mr: 1 }} />
              <InputBase
                placeholder="Search for a Conversation..."
                sx={{ borderRadius: 8, flex: 1, color: darkMode ? "grey.200" : "black" }}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchLoading && <CircularProgress size={20} sx={{ ml: 1, color: "#1976d2" }} />}
            </Box>

            <IconButton
              sx={{ ml: 1 }}
              color="inherit"
              onClick={handleCreateNewConversation}
              title="New Conversation"
              disabled={newConvLoading}
            >
              {newConvLoading ? <CircularProgress size={20} color="inherit" /> : <AddCommentIcon />}
            </IconButton>

            {!isTokenValid ? (
              <>
                <Button sx={{ ml: 1 }} color="inherit" onClick={() => setLoginModalOpen(true)}>
                  Login
                </Button>
                <Button sx={{ ml: 1 }} color="inherit" onClick={() => setSignupModalOpen(true)}>
                  Sign Up
                </Button>
                <Button sx={{ ml: 1 }} color="inherit" onClick={() => setForgotPasswordModalOpen(true)}>
                  Reset Password
                </Button>
              </>
            ) : (
              <>
                <Button sx={{ ml: 1 }} color="inherit">
                  Request Verification
                </Button>
                <IconButton onClick={handleLogout} sx={{ ml: 1, color: "error.main" }}>
                  <LogoutIcon />
                </IconButton>
              </>
            )}
          </Box>

          {!isMobile && (
            <Typography variant="h6">
              <Link component={NavLink} to="/home" sx={{ textDecoration: "none", color: "inherit" }}>
                Home
              </Link>
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
        onOpenForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />

      <SignupModal
        open={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onOpenLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        onOpenLogin={() => {
          setForgotPasswordModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default Navbar;