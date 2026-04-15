import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// UI Components
import PixelBox from '../components/ui/PixelBox';
import PixelInput from '../components/ui/PixelInput';
import PixelButton from '../components/ui/PixelButton';

export default function Profile() {
  const { user, login, logout, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password) {
      if (password.length < 8) {
        setError("Password must be at least 8 chars.");
        return;
      }
    }

    if (name.length < 2 || name.length > 50) {
      setError("Name must be between 2 and 50 chars.");
      return;
    }

    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      
      const response = await api.put('/me', payload);
      // Re-login with the updated user data but same token
      const updatedUser = response.data.user || response.data;
      login(updatedUser, token);
      
      setMessage('Profile updated successfully!');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Error updating profile.');
      }
    }
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const executeDelete = async (e) => {
    if (e) e.preventDefault();
    setDeleteError('');

    try {
      await api.delete('/me');
      logout();
      navigate('/auth');
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || err.response?.data?.error || 'Error deleting account.');
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <PixelBox className="w-full max-w-lg p-6 md:p-8 relative">
        <h2 className="text-xl md:text-2xl text-center mb-8 text-white uppercase tracking-widest drop-shadow-md">User Profile</h2>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-xs md:text-sm">
          {error && (
            <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center blink animate-pulse">
              {error}
            </div>
          )}
          {message && (
             <div className="bg-emerald-900 border-4 border-emerald-500 text-white p-3 text-center blink animate-pulse">
             {message}
           </div>
          )}

          <PixelInput
            label="Name:"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
          />

          <PixelInput
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PixelInput
            label="New Password (Optional):"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="LEAVE BLANK TO KEEP"
          />

          {password && (
            <PixelInput
              label="Confirm New Password:"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="CONFIRM NEW PASSWORD"
              required={!!password}
            />
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch justify-between">
            <PixelButton type="submit" variant="primary" className="px-6 py-4 w-full md:w-1/2 text-sm flex items-center justify-center text-center">
              [ SAVE CHANGES ]
            </PixelButton>
            
            <PixelButton 
              type="button" 
              variant="secondary" 
              onClick={handleOpenDeleteModal} 
              className="px-6 py-4 w-full md:w-1/2 text-[10px] md:text-xs flex items-center justify-center text-center leading-snug !text-red-400 hover:!text-red-300"
            >
              [ DELETE ACCOUNT ]
            </PixelButton>
          </div>
        </form>
      </PixelBox>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <PixelBox className="w-full max-w-sm p-6 relative border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]">
            <h3 className="text-red-500 font-bold mb-4 text-center text-lg md:text-xl uppercase tracking-widest drop-shadow-md">WARNING</h3>
            <p className="text-white text-xs md:text-sm text-center mb-6 leading-relaxed">
              Are you sure you want to delete your account? This action is irreversible.
            </p>

            <div className="flex flex-col gap-4">
              {deleteError && (
                <div className="bg-red-900 border-4 border-red-500 text-white p-2 text-xs text-center blink animate-pulse">
                  {deleteError}
                </div>
              )}

              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <PixelButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowDeleteModal(false)} 
                  className="py-3 w-full md:w-1/2 text-xs flex items-center justify-center"
                >
                  [ CANCEL ]
                </PixelButton>
                <PixelButton 
                  type="button" 
                  variant="primary" 
                  onClick={executeDelete}
                  className="py-3 w-full md:w-1/2 text-xs flex items-center justify-center !bg-red-700 hover:!bg-red-600 !border-red-500"
                >
                  [ CONFIRM ]
                </PixelButton>
              </div>
            </div>
          </PixelBox>
        </div>
      )}

      <div className="mt-8 text-neutral-600 text-xs text-center pt-4 w-full opacity-50">
        [ SYSTEM READY ]
      </div>
    </div>
  );
}
