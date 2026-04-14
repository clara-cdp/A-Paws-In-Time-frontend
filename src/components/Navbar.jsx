import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logicoBadge from '../assets/assets/images/APIT_logico.png';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="p-4 flex flex-wrap items-center justify-between w-full bg-[#0f172a] border-b-4 border-[#94a3b8] shadow-[0_4px_0_0_rgba(0,0,0,0.8)] z-50">

      <div className="flex items-center">
        <img src={logicoBadge} alt="badge" className="h-20 w-auto mr-4" style={{ imageRendering: 'pixelated' }} />
      </div>

      <div className="flex items-center gap-4 text-[10px] md:text-xs uppercase">
        {!isAuthenticated && (
          <Link to="/auth" className="hover:text-yellow-300 transition">Auth</Link>
        )}

        {isAuthenticated && (
          <>
            <Link to="/profile" className="hover:text-yellow-300 transition">Profile</Link>
            <Link to="/games" className="hover:text-yellow-300 transition">Lobby</Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin/users" className="hover:text-yellow-300 transition border-l-2 border-[#94a3b8] pl-4">Admin</Link>
        )}

        {isAuthenticated && (
          <button onClick={logout} className="hover:text-red-400 cursor-pointer transition border-l-2 border-[#94a3b8] pl-4">Logout</button>
        )}
      </div>

    </nav>
  );
}
