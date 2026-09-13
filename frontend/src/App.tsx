import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks';
import { loginSuccess, logout } from './store/slices/authSlice';
import { authAPI } from './services/api';

// Pages
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import TouristDashboard from './pages/tourist/Dashboard';
import DiscoverPage from './pages/tourist/Discover';
import DiscoveryDetail from './pages/tourist/DiscoveryDetail';
import DiscoverNewPlace from './pages/tourist/DiscoverNewPlace';
import TripPlanner from './pages/tourist/TripPlanner';
import MyTrips from './pages/tourist/MyTrips';
import GuidesBusiness from './pages/tourist/GuidesBusiness';
import Safety from './pages/tourist/Safety';
import GuideDashboard from './pages/guide/Dashboard';
import GuideProfile from './pages/guide/Profile';
import GuideDetail from './pages/tourist/GuideDetail';
import BusinessDashboard from './pages/business/Dashboard';
import BusinessProfile from './pages/business/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDiscoveries from './pages/admin/Discoveries';
import AdminAnalytics from './pages/admin/Analytics';

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verify();
          if (response.data.success) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            dispatch(loginSuccess({ user, token }));
          }
        } catch (error) {
          dispatch(logout());
        }
      }
    };

    verifyToken();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}`} /> : <RoleSelection />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user?.role}`} /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={`/${user?.role}`} /> : <Register />} />
        <Route path="/tourist" element={isAuthenticated && user?.role === 'tourist' ? <TouristDashboard /> : <Navigate to="/login" />} />
        <Route path="/discover" element={isAuthenticated && user?.role === 'tourist' ? <DiscoverPage /> : <Navigate to="/login" />} />
        <Route path="/discover/:id" element={isAuthenticated && user?.role === 'tourist' ? <DiscoveryDetail /> : <Navigate to="/login" />} />
        <Route path="/discover/new" element={isAuthenticated && user?.role === 'tourist' ? <DiscoverNewPlace /> : <Navigate to="/login" />} />
        <Route path="/planner" element={isAuthenticated && user?.role === 'tourist' ? <TripPlanner /> : <Navigate to="/login" />} />
        <Route path="/my-trips" element={isAuthenticated && user?.role === 'tourist' ? <MyTrips /> : <Navigate to="/login" />} />
        <Route path="/guides-business" element={isAuthenticated && user?.role === 'tourist' ? <GuidesBusiness /> : <Navigate to="/login" />} />
        <Route path="/guides/:id" element={isAuthenticated && user?.role === 'tourist' ? <GuideDetail /> : <Navigate to="/login" />} />
        <Route path="/safety" element={isAuthenticated && user?.role === 'tourist' ? <Safety /> : <Navigate to="/login" />} />
        <Route path="/guide" element={isAuthenticated && user?.role === 'guide' ? <GuideDashboard /> : <Navigate to="/login" />} />
        <Route path="/guide/profile" element={isAuthenticated && user?.role === 'guide' ? <GuideProfile /> : <Navigate to="/login" />} />
        <Route path="/business" element={isAuthenticated && user?.role === 'business' ? <BusinessDashboard /> : <Navigate to="/login" />} />
        <Route path="/business/profile" element={isAuthenticated && user?.role === 'business' ? <BusinessProfile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/discoveries" element={isAuthenticated && user?.role === 'admin' ? <AdminDiscoveries /> : <Navigate to="/login" />} />
        <Route path="/admin/analytics" element={isAuthenticated && user?.role === 'admin' ? <AdminAnalytics /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
