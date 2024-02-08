import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";

const PettyCash = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="PETTY CASH" subtitle="Petty Cash Page" />
    </Box>
  );
};

export default PettyCash;
