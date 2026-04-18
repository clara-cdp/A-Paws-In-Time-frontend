import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// UI Components
import PixelBox from '../components/ui/PixelBox';
import PixelInput from '../components/ui/PixelInput';
import PixelButton from '../components/ui/PixelButton';

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

    if (!isLogin) {
      if (name.length < 3 || name.length > 100) {
        setError("Name must be between 3 and 100 chars.");
        return;
      }
      if (password !== passwordConfirmation) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 chars.");
        return;
      }
      const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSymbols = /[^A-Za-z0-9]/.test(password);

      if (!hasMixedCase || !hasNumbers || !hasSymbols) {
        setError("Pass needs upper, lower, numbers, symbols.");
        return;
      }
    }

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.user, response.data.token);
        navigate('/games');
      } else {
        const response = await api.post('/auth/register', {
          name, email, password, password_confirmation: passwordConfirmation
        });
        login(response.data.user, response.data.token);
        navigate('/games');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Network err: API is completely down.');
      }
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">

      {/* UI Box */}
      <PixelBox className="w-full max-w-lg p-6 md:p-8 relative">

        {/* Main Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/images/APIT_logo_transp.png"
            alt="A Paws In Time Logo"
            className="w-max md:w-max drop-shadow-md"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs md:text-sm">

          {error && (
            <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center blink animate-pulse">
              {error}
            </div>
          )}

          {!isLogin && (
            <PixelInput
              label="Name:"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={100}
              placeholder="GUYBRUSH..."
            />
          )}

          <PixelInput
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="YOUR EMAIL..."
          />

          <PixelInput
            label="Password:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="SECRET..."
          />

          {!isLogin && (
            <PixelInput
              label="Confirm Password:"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="SECRET AGAIN..."
            />
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch justify-between">
            <PixelButton type="submit" variant="primary" className="px-6 py-4 w-full md:w-1/2 text-sm flex items-center justify-center text-center">
              [ START ]
            </PixelButton>

            <PixelButton
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(!isLogin);
                setError('');
              }}
              className="px-6 py-4 w-full md:w-1/2 text-[10px] md:text-xs flex items-center justify-center text-center leading-snug"
            >
              SWAP TO {isLogin ? 'REGISTER' : 'LOGIN'}
            </PixelButton>
          </div>
        </form>
      </PixelBox>
      <div className="mt-8 text-neutral-600 text-xs text-center pt-4 w-full opacity-50">
        [ SYSTEM READY ]
      </div>
    </div>
  )
}
