import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import DriverProfile from "./scenes/DriverProfile";
import Login from "./scenes/Login";
import DriverForm from "./scenes/DriverForm";
import DriverWork from "./scenes/DriverWork";
import Drivers from "./scenes/Drivers";
import SidebarE from "./scenes/global/SidebarEmployee";
import SidebarA from "./scenes/global/SidebarAccountant";
import { setUser } from "./redux/userSlice";
import { pulsar } from "ldrs";
import { tokens } from "./theme";
import { getUserRoleFromToken } from "./scenes/global/getUserRoleFromToken";
import UserProfile from "./scenes/UserProfile";
import NotFound from "./scenes/NotFound";
import Notifications from "./scenes/Notifications";
import Deduction from "./scenes/Deduction";
import Detail from "./scenes/Detail";
import DeductionSalary from "./scenes/DeductionSalary";
import CoSpends from "./scenes/CoSpends";
import PettyCash from "./scenes/PettyCash";
import SpendsList from "./scenes/SpendsList";
import DriversSalary from "./scenes/DriversSalary";
import EmployeesSalary from "./scenes/EmployeesSalary";
import AdminInvoices from "./scenes/AdminInvoices";

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
              {userRole === "Admin" && <Sidebar isSidebar={isSidebar} />}
              {userRole === "Employee" && <SidebarE isSidebar={isSidebar} />}
              {userRole === "Accountant" && <SidebarA isSidebar={isSidebar} />}
            </>
          )}
          <main className="content">
            {(currentUser || savedToken) && (
              <Topbar setIsSidebar={setIsSidebar} />
            )}
            <Routes>
              {currentUser || savedToken ? (
                <>
                  {userRole === "Admin" && (
                    <Route exact path="/" element={<Dashboard />} />
                  )}
                  {userRole === "Employee" && (
                    <Route exact path="/" element={<Drivers />} />
                  )}
                  {userRole === "Accountant" && (
                    <Route exact path="/" element={<Detail />} />
                  )}
                  <Route exact path="/team" element={<Team />} />
                  <Route
                    path="/driver-profile/:id"
                    element={<DriverProfile />}
                  />
                  <Route path="/user-profile/:id" element={<UserProfile />} />
                  <Route
                    exact
                    path="/manager-invoices"
                    element={<Invoices />}
                  />
                  <Route exact path="/invoices" element={<AdminInvoices />} />
                  <Route
                    exact
                    path="/notifications"
                    element={<Notifications />}
                  />
                  <Route exact path="/contacts" element={<Contacts />} />
                  <Route exact path="/bar" element={<Bar />} />
                  <Route exact path="/form" element={<Form />} />
                  <Route
                    exact
                    path="/employee-form"
                    element={<EmployeeForm />}
                  />
                  <Route exact path="/driver-form" element={<DriverForm />} />
                  <Route exact path="/driver-work" element={<DriverWork />} />
                  <Route exact path="/deduction" element={<Deduction />} />
                  <Route exact path="/drivers" element={<Drivers />} />
                  <Route exact path="/line" element={<Line />} />
                  <Route exact path="/pie" element={<Pie />} />
                  <Route exact path="/faq" element={<Faq />} />
                  <Route exact path="/geography" element={<Geography />} />
                  <Route exact path="/calendar" element={<Calendar />} />
                  <Route
                    exact
                    path="/drivers-salary"
                    element={<DriversSalary />}
                  />
                  <Route
                    exact
                    path="/employees-salary"
                    element={<EmployeesSalary />}
                  />
                  <Route exact path="/detail" element={<Detail />} />
                  <Route
                    exact
                    path="/deduction-salary"
                    element={<DeductionSalary />}
                  />
                  <Route exact path="/company-spends" element={<CoSpends />} />
                  <Route exact path="/pt-cash" element={<PettyCash />} />
                  <Route exact path="/spends-list" element={<SpendsList />} />
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
