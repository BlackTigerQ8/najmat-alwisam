import React, { useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userSlice";
import { tokens } from "../theme";

const Login = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  const colors = tokens(theme.palette.mode);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(credentials));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor={theme.palette.background.default}
    >
      <Typography variant="h4" gutterBottom>
        LOGIN
      </Typography>
      {status === "failed" && (
        <Typography
          color="error"
          variant="body2"
          style={{ marginTop: 16, marginBottom: 16 }}
        >
          {error}
        </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <TextField
          label="Email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
          sx={{
            ".MuiTextField-root": {
              marginBottom: 2,
            },
            ".MuiButton-root": {
              marginTop: 2,
            },
            ".MuiOutlinedInput-root": {
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.greenAccent[700],
              },
            },
            ".MuiInputLabel-root.Mui-focused": {
              color: colors.greenAccent[100],
            },
          }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
          sx={{
            ".MuiTextField-root": {
              marginBottom: 2,
            },
            ".MuiButton-root": {
              marginTop: 2,
            },
            ".MuiOutlinedInput-root": {
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.greenAccent[700],
              },
            },
            ".MuiInputLabel-root.Mui-focused": {
              color: colors.greenAccent[100],
            },
          }}
        />
        <Box mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={status === "loading"}
            fullWidth
            sx={{
              backgroundColor: "loading"
                ? colors.greenAccent[700]
                : colors.greenAccent[700],
              "&:hover": {
                backgroundColor: "loading"
                  ? colors.greenAccent[500]
                  : colors.greenAccent[500],
              },
            }}
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
