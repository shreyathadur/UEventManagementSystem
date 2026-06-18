import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AppRoutes } from './routes/AppRoutes';
import { StartupScreen } from './components/common/StartupScreen';

const AppContent: React.FC = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  if (!isBackendAvailable) {
    return <StartupScreen onAvailable={() => setIsBackendAvailable(true)} />;
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
