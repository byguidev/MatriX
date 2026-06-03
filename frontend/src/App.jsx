import SidebarDesktop from "./components/.common/sidebar-desktop";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ManageStudents from "./pages/student/manage-students";
import ManageCourses from "./pages/course/manage-courses";
import ManageClasses from "./pages/class/manage-classes";
import ManageInvoices from "./pages/invoice/manage-invoices";
import StudentProfile from "./pages/student/student-profile";
import CourseProfile from "./pages/course/course-profile";
import ClassProfile from "./pages/class/class-profile";
import HomePage from "./pages/home/home-page";
import UserLogin from "./pages/user/user-login";
import UserSignUp from "./pages/user/user-sign-up";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/sign-up";

  return (
    <div className="d-flex flex-grow-1 h-100" style={{ minWidth: 0 }}>
      {!isAuthPage && <SidebarDesktop />}
      <div className={`routes-container ${isAuthPage ? '' : 'content-wrapper'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/sign-up" element={<UserSignUp />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/manage-students" element={<ManageStudents />} />
          <Route path="/manage-students/:id" element={<StudentProfile />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/manage-courses/:id" element={<CourseProfile />} />
          <Route path="/manage-classes" element={<ManageClasses />} />
          <Route path="/manage-classes/:id" element={<ClassProfile />} />
          <Route path="/manage-invoices" element={<ManageInvoices />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;