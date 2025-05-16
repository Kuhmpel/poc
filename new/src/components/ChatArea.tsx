import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  Link as MuiLink,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  getConversationById,
  sendAuthedChatMessage,
  sendGuestChatMessage,
  createNewConversation,
  isAuthenticated,
  getGuestIdFromLocalStorage,
  setGuestIdInLocalStorage,
  clearGuestIdFromLocalStorage,
} from "../services/api";
import { IMessage, IConversation } from "../types/conversation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";
import CopyIcon from "./CopyIcon";

/**
 * Props:
 *  - conversationId (string | null): If authenticated and you have a known conversation _id, pass it in.
 *  - onNewConversation (function): Called if you create a brand new conversation for an authenticated user.
 */
interface ChatAreaProps {
  conversationId: string | null; // For authenticated only
  onNewConversation?: (conv: IConversation) => void;
}

/**
 * A helper function that detects plain-text URLs (like "movieverse.com" or "https://xyz")
 * and turns them into Markdown links so that ReactMarkdown will render them as clickable <a> elements.
 */
function linkifyText(text: string): string {
  const urlRegex =
    /((?:https?:\/\/)?(?:[\w-]+\.)+[a-zA-Z]{2,}(?:\/[\w.,@?^=%&:/~+#-]*)?)/g;
  return text.replace(urlRegex, (match) => {
    const hasProtocol =
      match.startsWith("http://") || match.startsWith("https://");
    const link = hasProtocol ? match : `https://${match}`;
    return `[${match}](${link})`;
  });
}

const BOT_AVATAR = "/bot.jpg";
const USER_AVATAR = "/OIP5.png";

interface CitationBubbleProps {
  isAboutMe: boolean;
}

const CitationBubble: React.FC<CitationBubbleProps> = ({ isAboutMe }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      sx={{ position: "absolute", bottom: "5px", right: "5px", zIndex: 10000 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#ffd54f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#ffca28" },
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: 16, color: "#000" }} />
      </Box>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              bottom: "100%",
              right: 0,
              marginBottom: "8px",
              backgroundColor: "#ffd54f",
              color: "#000",
              borderRadius: "8px",
              padding: "0.4rem 0.6rem",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {isAboutMe ? (
              <Typography sx={{ color: "inherit" }}>
                Source:{" "}
                <MuiLink
                  href="https://sonnguyenhoang.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "inherit",
                    textDecoration: "underline",
                    transition: "color 0.3s",
                    "&:hover": { color: "#1976d2" },
                  }}
                >
                  Son (David) Nguyen's Website
                </MuiLink>
              </Typography>
            ) : (
              <Typography sx={{ color: "inherit" }}>
                Source: General AI Knowledge
              </Typography>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

function isMessageAboutMe(text: string): boolean {
  const lower = text.toLowerCase();
  const pattern = /(?=.*\bnguyen\b)(?=.*\b(?:david|son)\b)/;
  return pattern.test(lower);
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  onNewConversation,
}) => {
  const theme = useTheme();

  useEffect(() => {
    const [navEntry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navEntry && navEntry.type === "reload") {
      localStorage.removeItem("guestConversationId");
    }
    if (performance.navigation.type === 1) {
      localStorage.removeItem("guestConversationId");
    }
  }, []);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [tempInput, setTempInput] = useState("");
  const [loadingState, setLoadingState] = useState<
    "idle" | "processing" | "thinking" | "generating" | "done"
  >("idle");
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && isAuthenticated()) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      setLoadingConversation(true);
      const conv = await getConversationById(id);
      setMessages(conv.messages);
      console.log("Loaded conversation:", conv);
    } catch (err) {
      console.error("Error loading conversation:", err);
    } finally {
      setLoadingConversation(false);
    }
  };

  const loadConversationAux = async (id: string) => {
    try {
      const conv = await getConversationById(id);
      setMessages(conv.messages);
      console.log("Loaded conversation:", conv);
    } catch (err) {
      console.error("Error loading conversation:", err);
    }
  };

  /**
   * Send the user's message to the server and receive a response.
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (loadingState !== "idle" && loadingState !== "done") return;

    const startTime = Date.now();
    let currentConvId = conversationId;

    try {
      // Authenticated user: ensure conversation exists
      if (isAuthenticated() && !currentConvId) {
        const newConv = await createNewConversation();
        currentConvId = newConv._id;
        if (onNewConversation) onNewConversation(newConv);
      }

      const userMessage: IMessage = {
        sender: "user",
        text: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessageHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setTempInput("");
      setInput("");

      setLoadingState("processing");

      setTimeout(() => {
        setLoadingState("thinking");
      }, 300);

      setTimeout(() => {
        setLoadingState("generating");
      }, 600);

      let answer = "";
      let returnedId = "";
      if (isAuthenticated()) {
        // Only send { message } for auth users (no conversationId in payload)
        const resp = await sendAuthedChatMessage(
          userMessage.text
          // Optionally, pass a session_id if backend supports; omit for your current backend
        );
        answer = resp.answer ?? resp.chatbotResponse ?? "";
        returnedId = resp.conversationId ?? currentConvId;
      } else {
        const guestId = getGuestIdFromLocalStorage();
        const resp = await sendGuestChatMessage(userMessage.text, guestId);
        answer = resp.answer ?? resp.chatbotResponse ?? "";
        returnedId = resp.guestId;
        if (!guestId && returnedId) {
          setGuestIdInLocalStorage(returnedId);
        }
      }

      const elapsed = Date.now() - startTime;
      const minimumTotalDelay = 900;

      if (elapsed < minimumTotalDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, minimumTotalDelay - elapsed),
        );
      }

      const botMessage: IMessage = {
        sender: "assistant",
        text: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      setLoadingState("done");

      // Only load conversation for authenticated users
      if (isAuthenticated() && currentConvId) {
        await loadConversationAux(currentConvId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setLoadingState("done");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp") {
      if (messageHistory.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) {
        setTempInput(input);
        setHistoryIndex(messageHistory.length - 1);
        setInput(messageHistory[messageHistory.length - 1]);
      } else {
        const newIndex = Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(messageHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex === -1) return;
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex > messageHistory.length - 1) {
        setHistoryIndex(-1);
        setInput(tempInput);
      } else {
        setHistoryIndex(newIndex);
        setInput(messageHistory[newIndex]);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleNewGuestConversation = () => {
    clearGuestIdFromLocalStorage();
    setMessages([]);
    setMessageHistory([]);
    setHistoryIndex(-1);
    setTempInput("");
  };

  const AnimatedEllipsis: React.FC = () => {
    const [dotCount, setDotCount] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }, []);
    return <span>{".".repeat(dotCount)}</span>;
  };

  const userLinkSx = {
    color: "#fff",
    textDecoration: "underline",
    "&:hover": {
      color: "#ddd",
      textDecoration: "underline",
    },
  };

  const assistantLinkSx = {
    color: theme.palette.mode === "dark" ? "white" : "black",
    textDecoration: "underline",
    "&:hover": {
      color: theme.palette.primary.main,
      textDecoration: "underline",
    },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{ overflowX: "hidden" }}
    >
      <Box
        flex="1"
        overflow="auto"
        padding="1rem"
        ref={scrollRef}
        bgcolor={theme.palette.background.default}
        sx={{ transition: "background-color 0.3s ease", overflowX: "hidden" }}
        onScroll={() => {
          if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
          }
        }}
      >
        {Array.isArray(messages) && messages.length === 0 &&
        !loadingConversation &&
        loadingState !== "generating" &&
        loadingState !== "thinking" &&
        loadingState !== "processing" ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <ChatBubbleOutlineIcon
              sx={{ fontSize: 80, color: theme.palette.text.secondary, mb: 2 }}
            />
            <Typography variant="h6" align="center" color="textSecondary">
              Hello! 👋 I'm Lumina - David Nguyen's personal assistant. Send me
              a message to get started! 🚀
            </Typography>
          </Box>
        ) : (
          <AnimatePresence initial={false}>
            {Array.isArray(messages)
              ? messages.map((msg, idx) => {
                  if (!msg.text) return null;
                  const isUser = msg.sender === "user";
                  const isBot = !isUser;
                  return (
                    <Box
                      key={idx}
                      sx={{
                        width: "100%",
                        maxWidth: "100%",
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        mb: 1,
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: "flex",
                          flexDirection: isUser ? "row-reverse" : "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          mx={1}
                        >
                          <img
                            src={isUser ? USER_AVATAR : BOT_AVATAR}
                            alt="avatar"
                            style={{
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              marginBottom: "4px",
                              transition: "transform 0.3s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.transform = "scale(1.0)";
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.7rem",
                              opacity: 0.8,
                              transition: "color 0.3s",
                              color:
                                theme.palette.mode === "dark" ? "white" : "black",
                              "&:hover": { color: theme.palette.primary.main },
                            }}
                          >
                            {isUser ? "You" : "Lumina"}
                          </Typography>
                        </Box>
                        <Box
                          borderRadius="8px"
                          p="0.5rem 1rem"
                          bgcolor={
                            isUser
                              ? "#1976d2"
                              : theme.palette.mode === "dark"
                              ? theme.palette.grey[800]
                              : "#e0e0e0"
                          }
                          color={isUser ? "white" : theme.palette.text.primary}
                          maxWidth="60%"
                          boxShadow={1}
                          sx={{
                            transition: "background-color 0.3s",
                            wordBreak: "break-word",
                            maxWidth: "75%",
                            overflow: "auto",
                            "&:hover": {
                              backgroundColor: isUser
                                ? theme.palette.primary.dark
                                : theme.palette.mode === "dark"
                                ? theme.palette.grey[700]
                                : "#d5d5d5",
                            },
                            paddingTop: "1.1rem",
                            position: "relative",
                          }}
                        >
                          {isBot && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                zIndex: 2,
                              }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {msg.text?.length > 100 ? (
                                  <CopyIcon text={msg.text} />
                                ) : null}
                              </motion.div>
                            </Box>
                          )}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {linkifyText(msg.text)}
                          </ReactMarkdown>
                          {isBot && (
                            <CitationBubble
                              isAboutMe={isMessageAboutMe(msg.text)}
                            />
                          )}
                        </Box>
                      </motion.div>
                    </Box>
                  );
                })
              : null}
            <Box ref={chatEndRef} />
          </AnimatePresence>
        )}

        {loadingState === "processing" && (
          <Box display="flex" alignItems="center" gap="0.5rem" mt="0.5rem">
            <CircularProgress size={18} />
            <Typography variant="caption" color="textSecondary">
              Processing Message
              <AnimatedEllipsis />
            </Typography>
          </Box>
        )}

        {loadingState === "thinking" && (
          <Box display="flex" alignItems="center" gap="0.5rem" mt="0.5rem">
            <CircularProgress size={18} />
            <Typography variant="caption" color="textSecondary">
              Thinking & Reasoning
              <AnimatedEllipsis />
            </Typography>
          </Box>
        )}

        {loadingState === "generating" && (
          <Box display="flex" alignItems="center" gap="0.5rem" mt="0.5rem">
            <CircularProgress size={18} />
            <Typography variant="caption" color="textSecondary">
              Generating Response
              <AnimatedEllipsis />
            </Typography>
          </Box>
        )}

        {loadingConversation && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          >
            <Box display="flex" alignItems="center">
              <CircularProgress size={24} />
              <Typography
                variant="caption"
                ml={1}
                sx={{
                  color: theme.palette.mode === "dark" ? "white" : "black",
                }}
              >
                Loading Conversation...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        p="1rem"
        pb="0.5rem"
        borderTop={`1px solid ${theme.palette.divider}`}
      >
        <Box display="flex">
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              transition: "background-color 0.3s ease",
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={loadingState !== "idle" && loadingState !== "done"}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: 1,
              marginLeft: "0.5rem",
              transition: "background-color 0.3s ease",
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography
        variant="caption"
        align="center"
        mt={0}
        mb={1}
        color="textSecondary"
      >
        By using this AI assistant, you agree to its{" "}
        <MuiLink
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          sx={assistantLinkSx}
        >
          terms and conditions
        </MuiLink>
        .
      </Typography>
    </Box>
  );
};

export default ChatArea;