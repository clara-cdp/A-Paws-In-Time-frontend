import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// UI Components
import PixelBox from '../components/ui/PixelBox';
import PixelInput from '../components/ui/PixelInput';
import PixelButton from '../components/ui/PixelButton';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('User');

  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/users/${id}`);
        const userData = response.data.user || response.data;

        const incomingRole = (typeof userData.role === 'string' && userData.role.toLowerCase() === 'admin') ? 'Admin' : 'User';
        setRole(incomingRole);
        setUserProfile(userData);
      } catch (err) {
        console.error(err);
        setError('Failed to load user. They may not exist.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (password && password.length < 8) {
      setError("Password must be at least 8 chars.");
      return;
    }

    if (name && (name.length < 2 || name.length > 50)) {
      setError("Name must be between 2 and 50 chars.");
      return;
    }

    try {
      const payload = { role, is_active: userProfile?.is_active };
      if (name.trim()) payload.name = name;
      if (email.trim()) payload.email = email;

      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }

      await api.put(`/admin/users/${id}`, payload);
      setMessage(`User #${id} updated successfully!`);
      setPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Error updating user.');
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
      await api.delete(`/admin/users/${id}`);
      navigate('/admin/users');
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || err.response?.data?.error || 'Error deleting user.');
    }
  };

  if (loading) {
    return <div className="mt-10 text-center text-xs text-[#2dd4bf] blink">LOADING USER DATA...</div>;
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <div className="w-full max-w-lg mb-4 flex justify-start">
        <PixelButton variant="secondary" onClick={() => navigate('/admin/users')} className="text-[10px] px-4 py-2">
          &lt; BACK TO DASHBOARD
        </PixelButton>
      </div>

      <PixelBox className="w-full max-w-lg p-6 md:p-8 relative">
        <h2 className="mb-2 text-center text-xl uppercase tracking-widest text-white drop-shadow-md md:text-2xl">UPDATE USER</h2>
        <p className="border-b-2 border-[#334155] pb-4 text-center text-[10px] text-[#94a3b8]">SYSTEM ID: {id}</p>

        {userProfile && (
          <div className="relative mt-4 flex flex-col gap-2 border-2 border-[#475569] bg-[#020617] p-4 text-[10px] text-[#cbd5e1] md:text-xs">
            <div className="absolute right-0 top-0 bg-[#1e293b] px-2 py-1 text-[8px] text-[#fcd34d]">READ ONLY</div>
            <p className="tracking-wide">ROLE: <span className="ml-1 text-[#fcd34d]">{userProfile.role || 'User'}</span></p>
            <p className="tracking-wide">STATUS: <span className={userProfile.is_active ? 'ml-1 text-emerald-400' : 'ml-1 text-red-400'}>{userProfile.is_active ? 'ACTIVE' : 'INACTIVE'}</span></p>

            {userProfile.games_count !== undefined && (
              <p className="tracking-wide">GAMES PLAYED: <span className="ml-1 text-[#fcd34d]">{userProfile.games_count}</span></p>
            )}

            {userProfile.game_list && userProfile.game_list.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile.game_list.map((avatar, idx) => (
                  <span key={idx} className="border border-[#475569] bg-[#1e293b] px-2 py-1 text-[#e2e8f0]">
                    {avatar || 'MissingNo'}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-xs md:text-sm">
          {error && (
            <div className="border-4 border-red-500 bg-red-950 p-3 text-center text-white blink animate-pulse">
              {error}
            </div>
          )}
          {message && (
            <div className="border-4 border-emerald-500 bg-emerald-950 p-3 text-center text-white blink animate-pulse">
              {message}
            </div>
          )}

          <PixelInput
            label="Name:"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={userProfile?.name || "Enter Name"}
            minLength={2}
            maxLength={50}
          />

          <PixelInput
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={userProfile?.email || "email@example.com"}
          />

          <div className="flex flex-col gap-2">
            <label className="text-[#2dd4bf] text-shadow-retro">Role:</label>
            <select
              className="pixel-input p-3 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <PixelInput
            label="Set New Password (Optional):"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="LEAVE BLANK TO KEEP CURRENT"
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
              [ SAVE ]
            </PixelButton>

            <PixelButton
              type="button"
              variant="danger"
              onClick={handleOpenDeleteModal}>

              [ TERMINATE ]
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
              Are you sure you want to permanently delete User #{id}? This action is irreversible.
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
                  variant="danger"
                  onClick={executeDelete}
                  className="py-3 w-full md:w-1/2 text-xs flex items-center justify-center"
                >
                  [ CONFIRM ]
                </PixelButton>
              </div>
            </div>
          </PixelBox>
        </div>
      )}

      <div className="mt-8 w-full pt-4 text-center text-[10px] text-[#94a3b8] opacity-60">
        [ SYSTEM ROOT ACCESS ]
      </div>
    </div>
  );
}
