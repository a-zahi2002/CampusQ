import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Question Feed</h1>
                  <p>Welcome to the feed! (Implementation in progress)</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/feed" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;