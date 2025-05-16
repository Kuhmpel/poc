import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  Grow,
  Slide,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SecurityIcon from "@mui/icons-material/Security";

/**
 * LandingPage Component
 *
 * This page welcomes users to MyCityMentor, your 24/7 City Hall assistant,
 * and highlights key features including usage modes: Anonymous, Registered, Verified.
 */
const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // States for staggered animations
  const [showHeader, setShowHeader] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowHeader(true), 300);
    const timer2 = setTimeout(() => setShowContent(true), 800);
    const timer3 = setTimeout(() => setShowCTA(true), 1300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const iconContainerStyle = {
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  };

  const cardStyle = {
    transition: "transform 0.3s, box-shadow 0.6s",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: theme.shadows[6],
    },
    borderRadius: 2,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const animatedLinkStyle = {
    color: "inherit",
    textDecoration: "none",
    display: "inline-block",
    transition: "transform 0.3s",
    "&:hover": {
      transform: "scale(1.05)",
      color: "primary.main",
      textDecoration: "underline",
    },
  };

  const animatedLinkStyle1 = {
    color: "inherit",
    textDecoration: "underline",
    marginTop: "2rem",
    display: "inline-block",
    transition: "transform 0.3s",
    "&:hover": {
      transform: "scale(1.05)",
      color: "primary.main",
      textDecoration: "underline",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 6, pb: 6 }}>
        {/* Header Section */}
        <Fade in={showHeader} timeout={800}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                color: theme.palette.mode === "dark" ? "white" : "black",
                transition: "color 0.3s",
              }}
            >
              Welcome to MyCityMentor
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
              Your 24/7 City Hall Assistant — get instant help and information about your city anytime.
            </Typography>
          </Box>
        </Fade>

        {/* Features Section */}
        <Slide direction="up" in={showContent} timeout={800}>
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: theme.palette.mode === "dark" ? "white" : "black",
              }}
            >
              How You Can Use MyCityMentor
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              sx={{ mb: 4 }}
            >
              Choose the experience that fits you best: Anonymous, Registered, or Verified.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {[
                {
                  icon: <ChatBubbleOutlineIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
                  title: "Anonymous Access",
                  description:
                    "Use MyCityMentor without signing up — get quick answers and info instantly.",
                  timeout: 900,
                },
                {
                  icon: <FlashOnIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
                  title: "Registered User",
                  description:
                    "Create an account to save your inquiries and receive personalized updates.",
                  timeout: 1000,
                },
                {
                  icon: <SecurityIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
                  title: "Verified Citizen",
                  description:
                    "Verify your identity to access advanced city services and personalized support.",
                  timeout: 1100,
                },
              ].map((feature, index) => (
                <Grow in={showContent} timeout={feature.timeout} key={index}>
                  <Card elevation={3} sx={{ ...cardStyle, width: 300 }}>
                    <Box sx={iconContainerStyle}>{feature.icon}</Box>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </Box>
          </Box>
        </Slide>

        {/* Call-to-Action Section */}
        <Fade in={showCTA} timeout={800}>
          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: theme.palette.mode === "dark" ? "white" : "black",
              }}
            >
              Get Started Today
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
              Use MyCityMentor anonymously or create an account for more features.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate("/signup")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                Create Account
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate("/chat")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                Use Anonymously
              </Button>
            </Box>
            <Typography variant="subtitle1" color="textSecondary">
              <Box component="a" href="/terms" sx={animatedLinkStyle1}>
                Terms of Service
              </Box>
            </Typography>
          </Box>
        </Fade>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          backgroundColor: theme.palette.background.paper,
          textAlign: "center",
          mt: "auto",
        }}
      >
        <Typography variant="body1" color="textSecondary">
          © {new Date().getFullYear()}{" "}
          <Box component="a" href="https://mycitymentor.com" sx={animatedLinkStyle}>
            MyCityMentor
          </Box>{" "}
          — Your trusted City Hall Assistant. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;