import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import RestaurantsPage from '@/pages/owner/RestaurantsPage';
import RestaurantDetailPage from '@/pages/owner/RestaurantDetailPage';
import MenuItemsPage from '@/pages/owner/MenuItemsPage';
import OrdersPage from '@/pages/owner/OrdersPage';
import UsersPage from '@/pages/owner/UsersPage';
import DeliveryConfigPage from '@/pages/owner/DeliveryConfigPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <RestaurantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute>
                <RestaurantDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id/menu"
            element={
              <ProtectedRoute>
                <MenuItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <DeliveryConfigPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
