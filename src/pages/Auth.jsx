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
    <div className="flex h-full max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col items-center justify-center overflow-hidden">

      {/* UI Box */}
      <PixelBox className="relative flex h-[90vh] max-h-[90vh] w-full max-w-lg flex-col overflow-hidden p-4 md:p-6">

        {/* Main Logo */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-3 md:py-4">
          <img
            src="/assets/images/APIT_logo_transp.png"
            alt="A Paws In Time Logo"
            className="max-h-[24vh] w-auto max-w-full drop-shadow-md md:max-h-[28vh] lg:max-h-[30vh]"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs md:gap-4 md:text-sm">

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

          <div className="mt-4 flex flex-col gap-3 items-stretch justify-between md:mt-5 md:flex-row md:gap-4">
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
    </div>
  )
}
