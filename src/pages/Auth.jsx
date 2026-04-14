import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Connected to POST /auth/login
        const response = await api.post('/auth/login', { email, password });
        // The API should ideally return { user: {...}, token: 'xxx' }
        login(response.data.user, response.data.token);
        navigate('/profile');
      } else {
        // Connected to POST /auth/register
        const response = await api.post('/auth/register', { email, password });
        login(response.data.user, response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      // Fails gracefully if the backend isn't running by showing the error
      setError(err.response?.data?.message || 'Network error: Ensure local API is running on port 3000');
    }
  };

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Register'} Endpoint Setup</h1>
      
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        Switch to {isLogin ? 'Register' : 'Login'} Form
      </button>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <div>
          <label style={{ display: 'block' }}>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.25rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block' }}>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.25rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
          Execute {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <hr style={{ margin: '3rem 0' }} />
      <h3>Mock Control Panel (No API Required)</h3>
      <p>Use these buttons if the backend is down:</p>
      <button onClick={() => { login({ id: 1, name: 'TestUser', role: 'user' }, 'mock-standard-token'); navigate('/profile'); }} style={{ marginRight: '1rem', cursor: 'pointer' }}>
        Force Mock Login (Standard)
      </button>
      <button onClick={() => { login({ id: 2, name: 'Admin', role: 'admin' }, 'mock-admin-token'); navigate('/profile'); }} style={{ cursor: 'pointer' }}>
        Force Mock Login (Admin)
      </button>
    </div>
  )
}
