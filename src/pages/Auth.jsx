import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom frontend validation for registration (matching the Laravel rules)
    if (!isLogin) {
       if (name.length < 3 || name.length > 100) {
         setError("Name must be between 3 and 100 characters.");
         return;
       }
       if (password !== passwordConfirmation) {
         setError("Passwords do not match.");
         return;
       }
       if (password.length < 8) {
         setError("Password must be at least 8 characters.");
         return;
       }
       const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
       const hasNumbers = /\d/.test(password);
       const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

       if (!hasMixedCase || !hasNumbers || !hasSymbols) {
          setError("Password must contain uppercase letters, lowercase letters, numbers, and symbols.");
          return;
       }
    }

    try {
      if (isLogin) {
        // Only sending email and password for login
        const response = await api.post('/auth/login', { email, password });
        login(response.data.user, response.data.token);
        navigate('/profile');
      } else {
        // Sending all required fields for Laravel registration
        const response = await api.post('/auth/register', { 
            name, 
            email, 
            password, 
            password_confirmation: passwordConfirmation 
        });
        login(response.data.user, response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      // Handle Laravel Validation Errors (422) if they get sent back
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Grab the first validation error message from the Laravel response array
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Network error: Ensure local API is running on port 3000');
      }
    }
  };

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Register'} Endpoint Setup</h1>
      
      <button onClick={() => {
        setIsLogin(!isLogin);
        setError('');
      }} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        Switch to {isLogin ? 'Register' : 'Login'} Form
      </button>

      {error && <p style={{ color: 'red', fontWeight: 'bold', maxWidth: '300px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        
        {!isLogin && (
          <div>
            <label style={{ display: 'block' }}>Name: </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              minLength={3}
              maxLength={100}
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
        )}

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

        {!isLogin && (
          <div>
            <label style={{ display: 'block' }}>Confirm Password: </label>
            <input 
              type="password" 
              value={passwordConfirmation} 
              onChange={(e) => setPasswordConfirmation(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
        )}

        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
          Execute {isLogin ? 'Login' : 'Register'}
        </button>
      </form>


    </div>
  )
}
