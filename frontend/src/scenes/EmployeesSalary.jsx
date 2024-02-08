import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";

const EmployeesSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="EMPLOYEES SALARY" subtitle="Employees Salary Page" />
    </Box>
  );
};

export default EmployeesSalary;
