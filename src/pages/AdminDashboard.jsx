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
    <div className="mb-4 border-[3px] border-[#94a3b8] bg-[#0f172a] p-4 relative transition-all" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-white text-sm tracking-wider uppercase truncate max-w-[200px] md:max-w-xs">{user.name}</h3>
          <p className="mt-2 text-[10px] tracking-widest text-[#94a3b8]">ID: {user.id}</p>
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
        <div className="mt-4 border-t-2 border-[#334155] pt-4 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-[#cbd5e1] md:text-xs">EMAIL: <span className="ml-2 text-[#2dd4bf]">{user.email}</span></p>
            <p className="text-[10px] text-[#cbd5e1] md:text-xs">ROLE: <span className="ml-2 text-[#fcd34d]">{user.role || 'User'}</span></p>
            <p className="text-[10px] text-[#cbd5e1] md:text-xs">STATUS: <span className={user.is_active ? 'ml-2 text-emerald-400' : 'ml-2 text-red-400'}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</span></p>

            {user.games_count !== undefined && (
              <p className="text-[10px] text-[#cbd5e1] md:text-xs">GAMES PLAYED: <span className="ml-2 text-[#fcd34d]">{user.games_count}</span></p>
            )}

            {user.game_list && user.game_list.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.game_list.map((avatar, idx) => (
                  <span key={idx} className="border border-[#475569] bg-[#1e293b] px-2 py-1 text-[10px] text-[#e2e8f0]">
                    {avatar || 'Hero'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
            <PixelButton
              onClick={handleBlockToggle}
              variant="danger"
              className="px-4 py-3 w-full md:w-auto text-[10px] md:text-xs flex items-center justify-center text-center leading-snug"
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
      <PixelBox className="w-full p-6 relative md:p-8">
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
          <div className="mb-6 border-4 border-red-500 bg-red-950 text-center text-xs text-white blink animate-pulse p-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="my-8 text-center text-xs text-[#2dd4bf] blink">LOADING DATABASE...</div>
        ) : (
          <div className="flex flex-col">
            {filteredUsers.length === 0 ? (
              <p className="my-8 text-center text-[10px] text-[#94a3b8] md:text-xs">NO USERS FOUND MATCHING "{searchQuery}"</p>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onRefresh={fetchUsers} />
              ))
            )}
          </div>
        )}

      </PixelBox>
      <div className="mt-8 w-full pt-4 text-center text-[10px] text-[#94a3b8] opacity-60">
        [ SYSTEM ROOT ACCESS ]
      </div>
    </div>
  );
}
