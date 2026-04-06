import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/dashboard/:role" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
