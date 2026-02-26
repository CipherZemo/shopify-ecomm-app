import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

function AdminNavbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link to="/admin" className="text-xl font-bold text-white tracking-tight">
        🛒 Shopify Admin
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link 
          to="/products" 
          className="text-sm text-gray-300 hover:text-white font-medium transition"
        >
          View Store
        </Link>
        
        <Link 
          to="/admin/products" 
          className="text-sm text-gray-300 hover:text-white font-medium transition"
        >
          Products
        </Link>
        
        <Link 
          to="/admin/orders" 
          className="text-sm text-gray-300 hover:text-white font-medium transition"
        >
          Orders
        </Link>
        
        <Link 
          to="/admin/users" 
          className="text-sm text-gray-300 hover:text-white font-medium transition"
        >
          Users
        </Link>

        <span className="text-sm text-gray-400">Hi, {user?.name || 'Admin'}</span>
        
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-300 font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;