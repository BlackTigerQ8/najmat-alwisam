import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";

const Detail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="DETAIL" subtitle="Detail Page" />
    </Box>
  );
};

export default Detail;
