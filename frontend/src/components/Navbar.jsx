import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useEffect } from "react";
import { fetchCart } from "../store/slices/cartSlice";
import { fetchWishlist } from "../store/slices/wishlistSlice";

function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistProducts.length;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-gray-800 tracking-tight">
        🛒 Shopify
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link
          to="/products"
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
        >
          Products
        </Link>

        {token && (
          <Link
            to="/orders"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Orders
          </Link>
        )}

        {token ? (
          <>
            <Link
              to="/wishlist"
              className="relative text-gray-600 hover:text-gray-900 transition"
            >
              <span className="text-xl">💝</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-gray-900 transition"
            >
              <span className="text-xl">🛒</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <span className="text-sm text-gray-600">
              Hi, {user?.name || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
