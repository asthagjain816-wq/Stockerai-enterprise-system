import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl font-semibold text-blue-100 mb-2">Page Not Found</p>
        <p className="text-blue-100 mb-8">Sorry, the page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition mx-auto"
        >
          <Home size={20} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}