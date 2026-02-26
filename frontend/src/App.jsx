import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch,  } from "react-redux";
import { useEffect } from "react";
import { getProfile,logout } from "./store/slices/authSlice";
import { initSocket, disconnectSocket } from './utils/socket';
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import OrdersPage from './pages/OrdersPage';
import AdminRoute from './components/AdminRoute';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ChatWidget from './components/ChatWidget';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return !token ? children : <Navigate to="/" />;
};

function AppContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token,user } = useSelector((state) => state.auth);

  useEffect(() => {
  if (token) {
    dispatch(getProfile()).unwrap()    // Validate token by fetching profile
      .then(() => {
        console.log('✅ Token valid');        
        const socket = initSocket(token);// Initialize socket for valid users
        if (socket) {
          socket.emit('join', JSON.parse(atob(token.split('.')[1])).id);
        }
      })
      .catch((error) => {
        console.log('🚨 Invalid token - logging out',error);
        // Token is invalid, clear everything
        dispatch(logout());
        navigate('/login');
      });
  } else {
    disconnectSocket();
  }
  
  return () => {
    // Cleanup socket on unmount only if logging out
    if (!token) {
      disconnectSocket();
    }
  };
}, [token, dispatch, navigate]);

  return (
    <>
      {user?.role === 'admin' ? <AdminNavbar /> : <Navbar />}
      <ChatWidget />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={ <ProtectedRoute> <CartPage /> </ProtectedRoute> } />
        <Route path="/wishlist" element={ <ProtectedRoute> <WishlistPage /> </ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute> <CheckoutPage /></ProtectedRoute> } />
        <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/payment-failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/products/create" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      </Routes>
      </>
  );
}

// Main App component
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
