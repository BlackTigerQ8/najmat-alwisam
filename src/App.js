import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/Team";
import Invoices from "./scenes/Invoices";
import Contacts from "./scenes/Contacts";
import Bar from "./scenes/Bar";
import Form from "./scenes/Form";
import Line from "./scenes/Line";
import Pie from "./scenes/Pie";
import FAQ from "./scenes/Faq";
import Geography from "./scenes/Geography";
import Calendar from "./scenes/Calendar";
import EmployeeForm from "./scenes/EmloyeeForm";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route exact path="/" element={<Dashboard />} />
              <Route exact path="/team" element={<Team />} />
              <Route exact path="/invoices" element={<Invoices />} />
              <Route exact path="/contacts" element={<Contacts />} />
              <Route exact path="/bar" element={<Bar />} />
              <Route exact path="/form" element={<Form />} />
              <Route exact path="/employee-form" element={<EmployeeForm />} />
              <Route exact path="/line" element={<Line />} />
              <Route exact path="/pie" element={<Pie />} />
              <Route exact path="/faq" element={<FAQ />} />
              <Route exact path="/geography" element={<Geography />} />
              <Route exact path="/calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

// 404 Page Route
// <Route path='*' element={<NotFound />} />
