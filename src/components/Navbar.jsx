import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
      <strong>A Paws In Time - Nav: </strong>
      
      {!isAuthenticated && (
        <Link to="/auth" style={{ marginRight: '1rem' }}>Auth</Link>
      )}
      
      {isAuthenticated && (
        <>
          <Link to="/profile" style={{ marginRight: '1rem' }}>Profile</Link>
          <Link to="/games" style={{ marginRight: '1rem' }}>Game Lobby</Link>
        </>
      )}

      {isAdmin && (
        <Link to="/admin/users" style={{ marginRight: '1rem' }}>Admin Dashboard</Link>
      )}

      {isAuthenticated && (
        <button onClick={logout} style={{ marginLeft: '1rem', cursor: 'pointer' }}>Logout</button>
      )}
    </nav>
  );
}
