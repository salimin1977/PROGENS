import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Command from './pages/Command';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Academic from './pages/Academic';
import Attendance from './pages/Attendance';
import Intervention from './pages/Intervention';
import Seeds from './pages/Seeds';
import Grow from './pages/Grow';
import Reap from './pages/Reap';
import Stem from './pages/Stem';
import Olympus from './pages/Olympus';
import Nexus from './pages/Nexus';
import Intelligence from './pages/Intelligence';
import DataHealth from './pages/DataHealth';
import Production from './pages/Production';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route path="/" element={<Command />} />
    <Route path="/students" element={<Students />} />
    <Route path="/students/:studentId" element={<StudentProfile />} />
    <Route path="/academic" element={<Academic />} />
    <Route path="/attendance" element={<Attendance />} />
    <Route path="/intervention" element={<Intervention />} />
    <Route path="/seeds" element={<Seeds />} />
    <Route path="/grow" element={<Grow />} />
    <Route path="/reap" element={<Reap />} />
    <Route path="/stem" element={<Stem />} />
    <Route path="/olympus" element={<Olympus />} />
    <Route path="/nexus" element={<Nexus />} />
    <Route path="/intelligence" element={<Intelligence />} />
    <Route path="/data-health" element={<DataHealth />} />
    <Route path="/production" element={<Production />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/settings" element={<Settings />} />
  </Route></Routes>;
}
