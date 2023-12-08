import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import Faq from "./scenes/Faq";
import Geography from "./scenes/Geography";
import Calendar from "./scenes/Calendar";
import EmployeeForm from "./scenes/EmloyeeForm";
import Profile from "./scenes/Profile";
import Login from "./scenes/Login";
import { setUser } from "./redux/userSlice";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const currentUser = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();
  const loading = useSelector((state) => state.user.status) === "loading";

  const savedToken = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("locastorage token", savedToken);
    if (!savedToken) {
      navigate("/login");
    }
  }, [savedToken]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {(currentUser || savedToken) && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {(currentUser || savedToken) && (
              <Topbar setIsSidebar={setIsSidebar} />
            )}
            <Routes>
              {currentUser || savedToken ? (
                <>
                  <Route exact path="/" element={<Dashboard />} />
                  <Route exact path="/team" element={<Team />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route exact path="/invoices" element={<Invoices />} />
                  <Route exact path="/contacts" element={<Contacts />} />
                  <Route exact path="/bar" element={<Bar />} />
                  <Route exact path="/form" element={<Form />} />
                  <Route
                    exact
                    path="/employee-form"
                    element={<EmployeeForm />}
                  />
                  <Route exact path="/line" element={<Line />} />
                  <Route exact path="/pie" element={<Pie />} />
                  <Route exact path="/faq" element={<Faq />} />
                  <Route exact path="/geography" element={<Geography />} />
                  <Route exact path="/calendar" element={<Calendar />} />
                </>
              ) : (
                <Route path="/login" element={<Login />} />
              )}
              <Route
                path="*"
                element={<Navigate to={currentUser ? "/" : "/login"} replace />}
              />
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
