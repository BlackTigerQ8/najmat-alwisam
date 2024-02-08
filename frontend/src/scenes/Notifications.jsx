import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../theme";

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="NOTIFICATIONS" subtitle="Important Notifications Page" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Passport Expiration Alert!
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Ahmed's (Driver) passport will expiry in 2 weeks.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            ID Expiration Alert!
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Khaled's (Driver) ID will expiry in 2 weeks.</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            New driver is added!
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            New driver (Abdullah Ahmed) is added in the system.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Notification!
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis
            nesciunt fugiat sit eligendi doloribus veritatis, nemo eos incidunt
            iusto esse fugit nobis quis, mollitia sunt sapiente dolore
            blanditiis nulla a.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Notification!
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis
            nesciunt fugiat sit eligendi doloribus veritatis, nemo eos incidunt
            iusto esse fugit nobis quis, mollitia sunt sapiente dolore
            blanditiis nulla a.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Notifications;
