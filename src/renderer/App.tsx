import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import BigTablePage from './pages/BigTablePage';
import HeavyCalculationsPage from './pages/HeavyCalculationsPage';
import CanvasTestPage from './pages/CanvasTestPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';
import TanStackQueryPage from './pages/TanStackQueryPage';
import KeyboardTestPage from './pages/KeyboardTestPage';
import CalendarTestPage from './pages/CalendarTestPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/big-table" element={<BigTablePage />} />
        <Route path="/calculations" element={<HeavyCalculationsPage />} />
        <Route path="/canvas" element={<CanvasTestPage />} />
        <Route path="/kitchen" element={<KitchenDisplayPage />} />
        <Route path="/tanstack" element={<TanStackQueryPage />} />
        <Route path="/keyboard" element={<KeyboardTestPage />} />
        <Route path="/calendar" element={<CalendarTestPage />} />
      </Routes>
    </Router>
  );
}
