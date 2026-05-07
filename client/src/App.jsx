import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPanel from './pages/AdminPanel';
import AskQuestionPage from './pages/AskQuestionPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route 
              path="/feed" 
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/:id" 
              element={
                <ProtectedRoute>
                  <QuestionDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ask" 
              element={
                <ProtectedRoute>
                  <AskQuestionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/" element={<Navigate to="/feed" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;