import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Sales from './pages/Sales';
import History from './pages/History';
import Login from './pages/Login';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ?
                <Navigate to="/products" replace /> :
                <Login setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Navigate to="/products" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Sales currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <History />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
