import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">🚫</p>
        <p className="text-lg font-medium text-gray-600 mb-2">Access Denied</p>
        <p className="text-sm text-gray-400">You need admin privileges to view this page</p>
      </div>
    );
  }

  return children;
}

export default AdminRoute;