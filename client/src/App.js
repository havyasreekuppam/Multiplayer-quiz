import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { useToast, ToastContainer } from './components/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import WaitingRoom from './pages/WaitingRoom';
import Quiz from './pages/Quiz';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { toasts, removeToast } = useToast();

  React.useEffect(() => {
    const pathToTab = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/history': 'history',
      '/analytics': 'analytics',
      '/profile': 'profile',
    };

    const nextTab = pathToTab[location.pathname];
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, [location.pathname]);

  const handleTabChange = React.useCallback(
    (nextTab) => {
      const tabToPath = {
        dashboard: '/dashboard',
        history: '/history',
        analytics: '/analytics',
        profile: '/profile',
      };

      setActiveTab(nextTab);

      if (tabToPath[nextTab] && location.pathname !== tabToPath[nextTab]) {
        navigate(tabToPath[nextTab]);
      }
    },
    [location.pathname, navigate]
  );

  const renderContent = () => {
    if (location.pathname === '/profile') {
      return <ProfilePage />;
    }

    if (location.pathname === '/history') {
      return <HistoryPage />;
    }

    if (location.pathname === '/analytics') {
      return <AnalyticsDashboard />;
    }

    if (activeTab === 'waiting') {
      return <WaitingRoom setActiveTab={handleTabChange} />;
    }

    if (activeTab === 'quiz') {
      return <Quiz setActiveTab={handleTabChange} />;
    }

    if (activeTab === 'leaderboard') {
      return <LeaderboardPage setActiveTab={handleTabChange} />;
    }

    return <Dashboard setActiveTab={handleTabChange} />;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuizProvider>
          <Routes>
            {/* OPTIONAL: keep these if you want */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* MAIN APP */}
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
