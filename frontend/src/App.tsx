import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Workers } from './pages/Workers';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { Layout } from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/contacts" element={<EmergencyContacts />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;



