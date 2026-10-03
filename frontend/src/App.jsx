import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";
import Overview from "./pages/Overview";
import TodaysBusiness from "./pages/TodaysBusiness";
import OpportunityDetail from "./pages/OpportunityDetail";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Activity from "./pages/Activity";

function ProtectedRoute({ children }) {
  const selectedMerchant = localStorage.getItem("selectedMerchant");

  if (!selectedMerchant) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Merchant entry */}
      <Route path="/login" element={<Login />} />

      {/* Main application */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                {/* Root → Login when no merchant, Overview when selected */}
                <Route
                  path="/"
                  element={
                    localStorage.getItem("selectedMerchant") ? (
                      <Navigate to="/overview" replace />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route path="/overview" element={<Overview />} />

                <Route
                  path="/todays-business"
                  element={<TodaysBusiness />}
                />

                <Route
                  path="/opportunity/:type"
                  element={<OpportunityDetail />}
                />

                <Route path="/transactions" element={<Transactions />} />

                <Route path="/customers" element={<Customers />} />

                <Route path="/policies" element={<Policies />} />

                <Route path="/activity" element={<Activity />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;