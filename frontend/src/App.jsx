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
function ComingSoon({ title }) {
  return (
    <div className="rounded-xl border border-border bg-white p-8">
      <h2 className="text-2xl font-semibold text-navy">
        {title}
      </h2>

      <p className="mt-2 text-text-secondary">
        This section will be built next.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Standalone merchant entry */}
      <Route path="/login" element={<Login />} />

      {/* Main application */}
      <Route
        path="/*"
        element={
          <AppLayout>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/overview" replace />}
              />

              <Route path="/overview" element={<Overview />} />

              <Route path="/todays-business" element={<TodaysBusiness />} />
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
        }
      />
    </Routes>
  );
}

export default App;