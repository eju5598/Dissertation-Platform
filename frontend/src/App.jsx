import { BrowserRouter, Routes, Route } from "react-router-dom";
import StaffLogin from "./pages/StaffLogin";
import ModuleLeaderDashboard from "./pages/ModuleLeaderDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentsPage from "./pages/StudentsPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProjectsPage from "./pages/ProjectsPage";
import AllocationsPage from "./pages/AllocationsPage";
import SupervisorProposals from "./pages/SupervisorProposals";
import SupervisorPreferences from "./pages/SupervisorPreferences";
import StudentProjectSelection from "./pages/StudentProjectSelection";
import SecondMarkerDashboard from "./pages/SecondMarkerDashboard";
import MarkingPage from "./pages/MarkingPage";




function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<StaffLogin />} />

        {/* Module Leader */}
        <Route
          path="/module-leader"
          element={
            <ProtectedRoute allow="MODULE_LEADER">
              <Layout>
                <ModuleLeaderDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Supervisor */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allow="SUPERVISOR">
              <Layout>
                <SupervisorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/marking/:assignmentId" element={<MarkingPage />} />
        
        <Route
  path="/projects"
  element={
    <ProtectedRoute>
      <Layout>
        <ProjectsPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/projects"
  element={
    <ProtectedRoute allow="STUDENT">
      <Layout>
        <StudentProjectSelection />
      </Layout>
    </ProtectedRoute>
  }
/>


<Route
  path="/allocations"
  element={
    <ProtectedRoute>
      <Layout>
        <AllocationsPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/supervisor/preferences"
  element={
    <ProtectedRoute allow="SUPERVISOR">
      <Layout>
        <SupervisorPreferences />
      </Layout>
    </ProtectedRoute>
  }
/>


<Route
  path="/supervisor/proposals"
  element={
    <ProtectedRoute allow="SUPERVISOR">
      <Layout>
        <SupervisorProposals />
      </Layout>
    </ProtectedRoute>
  }
/>

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allow="STUDENT">
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Second Marker */}
<Route
  path="/second-marker"
  element={
    <ProtectedRoute allow="SECOND_MARKER">
      <Layout>
        <SecondMarkerDashboard />
      </Layout>
    </ProtectedRoute>
  }
/>  


        <Route
  path="/students"
  element={
    <ProtectedRoute allow={["SUPERVISOR", "MODULE_LEADER"]}>
      <Layout>
        <StudentsPage />
      </Layout>
    </ProtectedRoute>
  }
/>


      </Routes>
    </BrowserRouter>
  );
}

export default App;
