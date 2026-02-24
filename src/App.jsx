import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PlansPage from './pages/PlansPage';
import PlannerPage from './pages/PlannerPage';
import LibraryPage from './pages/LibraryPage';
import WorkoutPlayerPage from './pages/WorkoutPlayerPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/plans" replace />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:planId" element={<PlannerPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="play/:planId" element={<WorkoutPlayerPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
