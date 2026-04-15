import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// UI Components
import PixelBox from '../components/ui/PixelBox';
import PixelInput from '../components/ui/PixelInput';
import PixelButton from '../components/ui/PixelButton';

function UserCard({ user, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const navigate = useNavigate();

  const handleBlockToggle = async () => {
    try {
      await api.put(`/admin/users/${user.id}/block`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setErrorModal(err.response?.data?.message || 'Error updating block status.');
    }
  };

  return (
    <div className="border-[3px] border-[#60a5fa] bg-[#0f172a] p-4 mb-4 relative transition-all" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-white text-sm tracking-wider uppercase truncate max-w-[200px] md:max-w-xs">{user.name}</h3>
          <p className="text-gray-400 text-[10px] mt-2 tracking-widest">ID: {user.id}</p>
        </div>
        <PixelButton
          onClick={() => setExpanded(!expanded)}
          variant="secondary"
          className="text-[10px] px-3 py-2 w-full md:w-auto text-center"
        >
          [ {expanded ? 'COLLAPSE' : 'VIEW MORE'} ]
        </PixelButton>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t-2 border-blue-900 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            <p className="text-gray-300 text-[10px] md:text-xs">EMAIL: <span className="text-[#93c5fd] ml-2">{user.email}</span></p>
            <p className="text-gray-300 text-[10px] md:text-xs">ROLE: <span className="text-[#93c5fd] ml-2">{user.role || 'User'}</span></p>
            <p className="text-gray-300 text-[10px] md:text-xs">STATUS: <span className={user.is_active ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</span></p>

            {user.games_count !== undefined && (
              <p className="text-gray-300 text-[10px] md:text-xs">GAMES PLAYED: <span className="text-yellow-400 ml-2">{user.games_count}</span></p>
            )}

            {user.game_list && user.game_list.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.game_list.map((avatar, idx) => (
                  <span key={idx} className="text-[10px] bg-blue-900 text-white px-2 py-1 border border-blue-500 rounded-sm">
                    {avatar || 'Hero'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
            <PixelButton
              onClick={handleBlockToggle}
              variant="secondary"
              className="px-4 py-3 w-full md:w-auto text-[10px] md:text-xs flex items-center justify-center text-center leading-snug !text-red-500 hover:!text-red-400"
            >
              [ {user.is_active ? 'BLOCK' : 'UNBLOCK'} ]
            </PixelButton>
            <PixelButton
              onClick={() => navigate(`/admin/users/${user.id}`)}
              variant="primary"
              className="text-[10px] md:text-xs px-4 py-3 w-full md:w-auto text-center"
            >
              [ UPDATE ]
            </PixelButton>
          </div>
        </div>
      )}

      {/* Retro Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 text-left">
          <PixelBox className="w-full max-w-sm p-6 relative border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]">
            <h3 className="text-red-500 font-bold mb-4 text-center text-lg uppercase tracking-widest drop-shadow-md">ACTION DENIED</h3>
            <p className="text-white text-xs text-center mb-6 leading-relaxed">
              {errorModal}
            </p>
            <PixelButton
              type="button"
              variant="secondary"
              onClick={() => setErrorModal('')}
              className="py-3 w-full text-xs flex items-center justify-center"
            >
              [ DISMISS ]
            </PixelButton>
          </PixelBox>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      // Accommodate Laravel paginated collections or flat arrays
      const data = response.data?.data || response.data?.users || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users. Check API endpoints or admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && String(u.id).includes(q))
    );
  });

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <PixelBox className="w-full p-6 md:p-8 relative">
        <h2 className="text-xl md:text-2xl text-center mb-8 text-white uppercase tracking-widest drop-shadow-md">Admin Dashboard</h2>

        {/* Find Bar */}
        <div className="mb-8 w-full">
          <PixelInput
            label="DATABASE SEARCH:"
            type="text"
            placeholder="Search by ID, Name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center blink animate-pulse mb-6 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-blue-300 text-xs blink my-8">LOADING DATABASE...</div>
        ) : (
          <div className="flex flex-col">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 text-[10px] md:text-xs my-8">NO USERS FOUND MATCHING "{searchQuery}"</p>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onRefresh={fetchUsers} />
              ))
            )}
          </div>
        )}

      </PixelBox>
      <div className="mt-8 text-[#60a5fa] text-[10px] text-center pt-4 w-full opacity-50">
        [ SYSTEM ROOT ACCESS ]
      </div>
    </div>
  );
}
