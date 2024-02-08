import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";

const SpendsList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="SPENDS LIST" subtitle="Spends List Page" />
    </Box>
  );
};

export default SpendsList;
