import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUser } from "./redux/userSlice";
import { pulsar } from "ldrs";
import { tokens } from "./theme";
import { getUserRoleFromToken } from "./scenes/global/getUserRoleFromToken";
import Topbar from "./scenes/arabic/Topbar";
import Login from "./scenes/Login";
import Form from "./scenes/arabic/Form";
// import Sidebar from "./scenes/global/Sidebar";
// import SidebarA from "./scenes/global/SidebarAccountant";
// import SidebarM from "./scenes/global/SidebarManager";
// import SidebarE from "./scenes/global/SidebarEmployee";
// import Dashboard from "./scenes/dashboard";
// import Team from "./scenes/Team";
// import Invoices from "./scenes/Invoices";
// import Contact from "./scenes/Contact";
// import SpendType from "./scenes/SpendType";
// import Bar from "./scenes/Bar";
// import Line from "./scenes/Line";
// import Pie from "./scenes/Pie";
// import Faq from "./scenes/Faq";
// import Geography from "./scenes/Geography";
// import Calendar from "./scenes/Calendar";
// import DriverProfile from "./scenes/DriverProfile";
// import DriverForm from "./scenes/DriverForm";
// import DriverWork from "./scenes/DriverWork";
// import Drivers from "./scenes/Drivers";

// import UserProfile from "./scenes/UserProfile";
// import NotFound from "./scenes/NotFound";
// import Notifications from "./scenes/Notifications";
// import Deduction from "./scenes/Deduction";
// import AccountantDashboard from "./scenes/dashboard/AccountantDashboard";
// import BankState from "./scenes/BankState";
// import PettyCash from "./scenes/PettyCash";
// import DriversSalary from "./scenes/DriversSalary";
// import EmployeesSalary from "./scenes/EmployeesSalary";
// import AdminInvoices from "./scenes/AdminInvoices";
// import ManagerDashboard from "./scenes/dashboard/ManagerDashboard";
// import Messages from "./scenes/Messages";
// import CoSpends from "./scenes/CoSpends";
// import Profits from "./scenes/Profits";
// import Income from "./scenes/Income";

function App() {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isSidebar, setIsSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = useSelector((state) => state.user.userInfo);
  const userRole =
    useSelector((state) => state.user.userRole) || getUserRoleFromToken();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const savedToken = localStorage.getItem("token");

  useEffect(() => {
    const checkUser = async () => {
      if (savedToken) {
        const savedUser = JSON.parse(localStorage.getItem("userInfo"));
        if (savedUser) {
          dispatch(setUser(savedUser));
        }
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    };

    checkUser();
  }, [navigate, dispatch, savedToken]);

  pulsar.register();
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </div>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {(currentUser || savedToken) && (
            <>
              {/* {userRole === "Admin" && <Sidebar isSidebar={isSidebar} />}
              {userRole === "Manager" && <SidebarM isSidebar={isSidebar} />}
              {userRole === "Accountant" && <SidebarA isSidebar={isSidebar} />}
              {userRole === "Employee" && <SidebarE isSidebar={isSidebar} />} */}
            </>
          )}
          <main className="content">
            {(currentUser || savedToken) && (
              <Topbar setIsSidebar={setIsSidebar} />
            )}
            <Routes>
              {currentUser || savedToken ? (
                <>
                  {userRole === "Admin" && <></>}
                  {userRole === "Manager" && <></>}
                  {userRole === "Employee" && <></>}
                  {userRole === "Accountant" && <></>}

                  <Route exact path="/form" element={<Form />} />
                </>
              ) : (
                <Route path="/login" element={<Login />} />
              )}
              <Route
                path="*"
                // element={<NotFound />}
                element={<Navigate to={currentUser ? "/" : "/login"} replace />}
              />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

// 404 Page Route
// <Route path='*' element={<NotFound />} />
