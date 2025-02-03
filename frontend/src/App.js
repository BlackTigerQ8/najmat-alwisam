import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { I18nextProvider, Trans, useTranslation } from "react-i18next";
import { pulsar } from "ldrs";
import { tokens } from "./theme";
import { getUserRoleFromToken } from "./scenes/global/getUserRoleFromToken";
import { setUser } from "./redux/userSlice";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import SidebarA from "./scenes/global/SidebarAccountant";
import SidebarM from "./scenes/global/SidebarManager";
import SidebarE from "./scenes/global/SidebarEmployee";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/Team";
import Invoices from "./scenes/Invoices";
import Contact from "./scenes/Contact";
import SpendType from "./scenes/SpendType";
import Bar from "./scenes/Bar";
import Form from "./scenes/Form";
import Line from "./scenes/Line";
import Pie from "./scenes/Pie";
import Faq from "./scenes/Faq";
import Geography from "./scenes/Geography";
import Calendar from "./scenes/Calendar";
import DriverProfile from "./scenes/DriverProfile";
import Login from "./scenes/Login";
import DriverForm from "./scenes/DriverForm";
import DriverWork from "./scenes/DriverWork";
import Drivers from "./scenes/Drivers";

import UserProfile from "./scenes/UserProfile";
// import NotFound from "./scenes/NotFound";
import Notifications from "./scenes/Notifications";
import Deduction from "./scenes/Deduction";
import AccountantDashboard from "./scenes/dashboard/AccountantDashboard";
import BankState from "./scenes/BankState";
import PettyCash from "./scenes/PettyCash";
import DriversSalary from "./scenes/DriversSalary";
import EmployeesSalary from "./scenes/EmployeesSalary";
import AdminInvoices from "./scenes/AdminInvoices";
import ManagerInvoices from "./scenes/ManagerInvoices";
import ManagerDashboard from "./scenes/dashboard/ManagerDashboard";
import Messages from "./scenes/Messages";
import CoSpends from "./scenes/CoSpends";
import Profits from "./scenes/Profits";
import Income from "./scenes/Income";
import InvoicesArchive from "./scenes/InvoiceArchive";
import CompanyFiles from "./scenes/CompanyFiles";
import DeactivatedDrivers from "./scenes/DeactivatedDrivers";
import ArchiveForm from "./scenes/ArchiveForm";
import SearchArchive from "./scenes/SearchArchive";
import LandingPage from "./scenes/global/LandingPage";

const lngs = {
  en: { nativeName: "English" },
  de: { nativeName: "Arabic" },
};

function App() {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isSidebar, setIsSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const currentUser = useSelector((state) => state.user.userInfo);
  const userRole =
    useSelector((state) => state.user.userRole) || getUserRoleFromToken();
  const savedToken = localStorage.getItem("token");

  useEffect(() => {
    const lng = navigate.language;
    i18n.changeLanguage(lng);
  }, []);

  const lng = navigator.language;

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

  // Role-Based Routes
  const adminRoutes = [
    { path: "/", element: <Dashboard /> },
    { path: "/admin-invoices", element: <AdminInvoices /> },
    { path: "/archive", element: <InvoicesArchive /> },
    { path: "/archive-form", element: <ArchiveForm /> },
    { path: "/deactivated-drivers", element: <DeactivatedDrivers /> },
    { path: "/invoices-archive", element: <InvoicesArchive /> },
  ];

  const managerRoutes = [
    { path: "/", element: <Navigate to="/team" replace /> },
    { path: "/manager-invoices", element: <ManagerInvoices /> },
    { path: "/archive", element: <InvoicesArchive /> },
    { path: "/archive-form", element: <ArchiveForm /> },
    { path: "/invoices-archive", element: <InvoicesArchive /> },
    { path: "/deactivated-drivers", element: <DeactivatedDrivers /> },
  ];

  const accountantRoutes = [
    { path: "/", element: <Navigate to="/employees-salary" replace /> },
    { path: "/drivers-salary", element: <DriversSalary /> },
    { path: "/employees-salary", element: <EmployeesSalary /> },
    { path: "/bank-statement", element: <BankState /> },
    { path: "/petty-cash", element: <PettyCash /> },
    { path: "/accountant-dashboard", element: <AccountantDashboard /> },
    { path: "/company-spends", element: <CoSpends /> },
    { path: "/profits", element: <Profits /> },
    { path: "/income", element: <Income /> },
    { path: "/spend-type", element: <SpendType /> },
  ];

  const employeeRoutes = [
    { path: "/", element: <Navigate to="/invoices" replace /> },
    { path: "/invoices-archive", element: <InvoicesArchive /> },
    { path: "/archive-form", element: <ArchiveForm /> },
    { path: "/searching-archive", element: <SearchArchive /> },
  ];

  const getRoutesByRole = () => {
    switch (userRole) {
      case "Admin":
        return adminRoutes;
      case "Manager":
        return managerRoutes;
      case "Accountant":
        return accountantRoutes;
      case "Employee":
        return employeeRoutes;
      default:
        return [];
    }
  };

  const getDefaultRedirect = () => {
    switch (userRole) {
      case "Admin":
        return "/";
      case "Manager":
        return "/team";
      case "Accountant":
        return "/employees-salary";
      case "Employee":
        return "/invoices";
      default:
        return "/login";
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {(currentUser || savedToken) &&
              location.pathname !== "/searching-archive" && (
                <>
                  {userRole === "Admin" && <Sidebar isSidebar={isSidebar} />}
                  {userRole === "Manager" && <SidebarM isSidebar={isSidebar} />}
                  {userRole === "Accountant" && (
                    <SidebarA isSidebar={isSidebar} />
                  )}
                  {userRole === "Employee" && (
                    <SidebarE isSidebar={isSidebar} />
                  )}
                </>
              )}
            <main className="content">
              {(currentUser || savedToken) &&
                location.pathname !== "/searching-archive" && (
                  <Topbar setIsSidebar={setIsSidebar} />
                )}
              <Routes>
                {(currentUser || savedToken) && (
                  <>
                    {getRoutesByRole().map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                    <Route
                      path="*"
                      element={<Navigate to={getDefaultRedirect()} replace />}
                    />
                  </>
                )}

                {currentUser || savedToken ? (
                  <>
                    <Route
                      exact
                      path="/company-files"
                      element={<CompanyFiles />}
                    />
                    <Route
                      exact
                      path="/searching-archive"
                      element={<SearchArchive />}
                    />
                    <Route exact path="/contact" element={<Contact />} />
                    <Route exact path="/messages" element={<Messages />} />
                    <Route exact path="/bar" element={<Bar />} />
                    <Route exact path="/form" element={<Form />} />
                    <Route exact path="/driver-form" element={<DriverForm />} />
                    <Route exact path="/driver-work" element={<DriverWork />} />
                    <Route exact path="/deduction" element={<Deduction />} />
                    <Route exact path="/drivers" element={<Drivers />} />
                    <Route exact path="/line" element={<Line />} />
                    <Route exact path="/pie" element={<Pie />} />
                    <Route exact path="/faq" element={<Faq />} />
                    <Route exact path="/geography" element={<Geography />} />
                    <Route exact path="/calendar" element={<Calendar />} />
                    <Route exact path="/team" element={<Team />} />
                    <Route
                      path="/driver-profile/:id"
                      element={<DriverProfile />}
                    />
                    <Route path="/user-profile/:id" element={<UserProfile />} />
                    <Route exact path="/invoices" element={<Invoices />} />
                    <Route
                      exact
                      path="/notifications"
                      element={<Notifications />}
                    />
                  </>
                ) : (
                  <Route path="/login" element={<Login />} />
                )}
                <Route
                  path="*"
                  // element={<NotFound />}
                  element={
                    <Navigate
                      to={currentUser ? getDefaultRedirect() : "/login"}
                      replace
                    />
                  }
                />
                <Route path="/" element={<LandingPage />} />
              </Routes>
            </main>
            <ToastContainer />
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </I18nextProvider>
  );
}

export default App;

// 404 Page Route
// <Route path='*' element={<NotFound />} />
