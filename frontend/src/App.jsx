import SidebarDesktop from "./components/.common/sidebar-desktop";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ManageStudents from "./pages/student/manage-students";
import ManageCourses from "./pages/course/manage-courses";
import ManageClasses from "./pages/class/manage-classes";
import ManageInvoices from "./pages/invoice/manage-invoices";
import StudentProfile from "./pages/student/student-profile";
import CourseProfile from "./pages/course/course-profile";
import ClassProfile from "./pages/class/class-profile";
import HomePage from "./pages/home/home-page";

import "./styles/global.css";

// organiza o layout base e define as rotas principais do painel
function App() {
  return (
    // mantem sidebar fixa e area de conteudo navegavel
    <div className="d-flex flex-grow-1 h-100" style={{ minWidth: 0 }}>
      <BrowserRouter>
        <SidebarDesktop />
        <div className="routes-container content-wrapper">
          <Routes>
            {/* separa os fluxos de alunos, cursos e turmas */}
            <Route path="/" element={<Navigate to="/home" replace />} />
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
      </BrowserRouter>
    </div>
  );
}

export default App;
