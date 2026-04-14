import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMockLogin = (role) => {
    login({ id: 1, name: 'TestUser', role });
    navigate('/profile');
  };

  return (
    <div>
      <h1>Login / Register</h1>
      <p>Endpoints mapping:</p>
      <ul>
        <li>POST /auth/login</li>
        <li>POST /auth/register</li>
      </ul>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #aaa', display: 'inline-block' }}>
        <h3>Mock Controls (Dev Only)</h3>
        <p>Since API is unhooked, use these to test protected routes:</p>
        <button onClick={() => handleMockLogin('user')} style={{ marginRight: '1rem', cursor: 'pointer' }}>
          Mock Login (Standard User)
        </button>
        <button onClick={() => handleMockLogin('admin')} style={{ cursor: 'pointer' }}>
          Mock Login (Admin User)
        </button>
      </div>
    </div>
  )
}
