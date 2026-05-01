import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { CommandCenter } from "./pages/CommandCenter";
import { History } from "./pages/History";
import { Integrations } from "./pages/Integrations";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { Settings } from "./pages/Settings";
import { DepartmentRoom } from "./pages/DepartmentRoom";
import { DepartmentsFloor } from "./pages/DepartmentsFloor";
import { WorkflowDetail } from "./pages/WorkflowDetail";

export default function App() {
  const location = useLocation();

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="min-h-full"
        >
          <Routes location={location}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/departments" element={<DepartmentsFloor />} />
            <Route path="/departments/:departmentId" element={<DepartmentRoom />} />
            <Route path="/workflow/:id" element={<WorkflowDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
