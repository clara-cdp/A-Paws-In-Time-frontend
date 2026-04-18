import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import logicoBadge from '../assets/assets/images/APIT_logico.png';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const navClass = ({ isActive }) => 
    `hover:text-yellow-300 transition ${isActive ? 'text-teal-400' : ''}`;

  const adminNavClass = ({ isActive }) => 
    `hover:text-yellow-300 transition border-l-2 border-[#94a3b8] pl-4 ${isActive ? 'text-teal-400' : ''}`;

  return (
    <nav className="p-4 flex flex-wrap items-center justify-between w-full bg-[#0f172a] border-b-4 
    border-[#94a3b8] shadow-[0_4px_0_0_rgba(0,0,0,0.8)] z-50">

      <div className="flex items-center">
        <img src={logicoBadge} alt="badge" className="h-20 w-auto mr-4" />
      </div>

      <div className="flex items-center gap-4 text-[10px] md:text-xs uppercase">
        {!isAuthenticated && (
          <NavLink to="/auth" className={navClass}>Welcome</NavLink>
        )}

        {isAuthenticated && (
          <>
            <NavLink to="/profile" className={navClass}>Profile</NavLink>
            <NavLink to="/games" className={navClass}>Lobby</NavLink>
          </>
        )}

        {isAdmin && (
          <NavLink to="/admin/users" className={adminNavClass}>Admin</NavLink>
        )}

        {isAuthenticated && (
          <button onClick={logout} className="hover:text-red-400 cursor-pointer transition border-l-2 
          border-[#94a3b8] pl-4 uppercase">Logout</button>
        )}
      </div>

    </nav>
  );
}
