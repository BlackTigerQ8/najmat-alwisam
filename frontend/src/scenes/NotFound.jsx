import React from "react";
import { Box } from "@mui/material";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { tokens } from "../theme";
import { useTheme } from "@emotion/react";

const NotFound = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mt="50%" display="flex" justifyContent="center">
      <Header
        title="404 Not Found"
        subtitle={
          <Link
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              justifyContent: "center",
              fontSize: "24px",
              border: `1px solid ${colors.grey[100]}`,
            }}
            to="/"
          >
            Go Back
          </Link>
        }
      />
    </Box>
  );
};

export default NotFound;
