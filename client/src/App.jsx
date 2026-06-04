import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CveCenter from './pages/CveCenter';
import AiAnalyst from './pages/AiAnalyst';
import ThreatExplainer from './pages/ThreatExplainer';
import SecurityNews from './pages/SecurityNews';
import AttackExplorer from './pages/AttackExplorer';
import ThreatTrends from './pages/ThreatTrends';
import IocAnalysis from './pages/IocAnalysis';
import SecurityToolkit from './pages/SecurityToolkit';
import AiAssistant from './pages/AiAssistant';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="cve" element={<CveCenter />} />
        <Route path="analyst" element={<AiAnalyst />} />
        <Route path="explainer" element={<ThreatExplainer />} />
        <Route path="news" element={<SecurityNews />} />
        <Route path="attack" element={<AttackExplorer />} />
        <Route path="trends" element={<ThreatTrends />} />
        <Route path="ioc" element={<IocAnalysis />} />
        <Route path="toolkit" element={<SecurityToolkit />} />
        <Route path="assistant" element={<AiAssistant />} />
      </Route>
    </Routes>
  );
}
