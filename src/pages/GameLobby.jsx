import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import PixelBox from '../components/ui/PixelBox';
import PixelInput from '../components/ui/PixelInput';
import PixelButton from '../components/ui/PixelButton';

const MAX_SLOTS = 3;

function SaveSlot({ game, slotNumber, onPlay, onRename, onDelete, busyAction }) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarName, setAvatarName] = useState(game.avatar);
  const isBusy = busyAction?.gameId === game.id;

  const handleRenameSubmit = async (event) => {
    event.preventDefault();
    const trimmedAvatar = avatarName.trim();

    if (!trimmedAvatar || trimmedAvatar === game.avatar) {
      setIsEditing(false);
      setAvatarName(game.avatar);
      return;
    }

    const renamed = await onRename(game.id, trimmedAvatar);
    if (renamed) {
      setIsEditing(false);
    }
  };

  return (
    <div className="border-4 border-[#52525b] bg-black/70 p-4 md:p-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 tracking-[0.2em]">SAVE SLOT {slotNumber}</p>
          {!isEditing ? (
            <>
              <h3 className="mt-3 text-sm md:text-base text-yellow-300 break-words leading-relaxed">
                {game.avatar}
              </h3>
              <p className="mt-3 text-[10px] text-teal-300">GAME ID: {game.id}</p>
            </>
          ) : (
            <form onSubmit={handleRenameSubmit} className="mt-4 flex flex-col gap-3">
              <PixelInput
                id={`avatar-${game.id}`}
                label="Avatar Name:"
                value={avatarName}
                onChange={(event) => setAvatarName(event.target.value)}
                minLength={3}
                maxLength={45}
                required
                disabled={isBusy}
              />
              <div className="flex flex-col gap-3 md:flex-row">
                <PixelButton
                  type="submit"
                  variant="primary"
                  className="w-full px-4 py-3 text-[10px] md:w-auto"
                  disabled={isBusy}
                >
                  {isBusy ? '[ SAVING... ]' : '[ SAVE NAME ]'}
                </PixelButton>
                <PixelButton
                  type="button"
                  variant="secondary"
                  className="w-full px-4 py-3 text-[10px] md:w-auto"
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarName(game.avatar);
                  }}
                  disabled={isBusy}
                >
                  [ CANCEL ]
                </PixelButton>
              </div>
            </form>
          )}
        </div>

        {!isEditing && (
          <div className="flex flex-col gap-3 md:w-52">
            <PixelButton
              type="button"
              variant="primary"
              className="w-full px-4 py-3 text-[10px]"
              onClick={() => onPlay(game.id)}
              disabled={isBusy}
            >
              {isBusy ? '[ OPENING... ]' : '[ CONTINUE ]'}
            </PixelButton>
            <PixelButton
              type="button"
              variant="secondary"
              className="w-full px-4 py-3 text-[10px]"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
            >
              [ RENAME ]
            </PixelButton>
            <PixelButton
              type="button"
              variant="danger"
              className="w-full px-4 py-3 text-[10px]"
              onClick={() => onDelete(game)}
              disabled={isBusy}
            >
              [ DELETE ]
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameLobby() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [createError, setCreateError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptySlots = Math.max(0, MAX_SLOTS - games.length);

  const fetchGames = async () => {
    try {
      setListError('');
      const response = await api.get('/games');
      setGames(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      setListError(error.response?.data?.message || 'Failed to load your save slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const clearMessages = () => {
    setCreateError('');
    setActionError('');
    setSuccessMessage('');
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();
    clearMessages();

    const trimmedAvatar = newAvatar.trim();
    if (trimmedAvatar.length < 3) {
      setCreateError('Avatar name must be at least 3 characters.');
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.post('/games', { avatar: trimmedAvatar });
      const createdGame = response.data?.game;
      const createdGameId = createdGame?.id;

      setSuccessMessage(response.data?.message || 'New journey started!');
      setNewAvatar('');
      await fetchGames();

      if (createdGameId) {
        navigate(`/games/${createdGameId}`);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422 && error.response?.data?.errors?.avatar?.[0]) {
        setCreateError(error.response.data.errors.avatar[0]);
      } else {
        setCreateError(error.response?.data?.message || 'Failed to create a new game.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlay = async (gameId) => {
    clearMessages();
    setBusyAction({ gameId, type: 'play' });

    try {
      await api.get(`/games/${gameId}`);
      navigate(`/games/${gameId}`);
    } catch (error) {
      console.error(error);
      setActionError(error.response?.data?.message || 'Failed to open this save slot.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRename = async (gameId, avatar) => {
    clearMessages();
    setBusyAction({ gameId, type: 'rename' });

    try {
      const response = await api.put(`/games/${gameId}`, { avatar });
      setGames((currentGames) =>
        currentGames.map((game) =>
          game.id === gameId
            ? { ...game, avatar: response.data?.game?.avatar || avatar }
            : game
        )
      );
      setSuccessMessage(response.data?.message || 'Game progress saved.');
      return true;
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422 && error.response?.data?.errors?.avatar?.[0]) {
        setActionError(error.response.data.errors.avatar[0]);
      } else {
        setActionError(error.response?.data?.message || 'Failed to rename this save.');
      }
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    clearMessages();
    setBusyAction({ gameId: deleteTarget.id, type: 'delete' });

    try {
      const response = await api.delete(`/games/${deleteTarget.id}`);
      setGames((currentGames) => currentGames.filter((game) => game.id !== deleteTarget.id));
      setSuccessMessage(response.data?.message || 'Game deleted successfully.');
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      setActionError(error.response?.data?.message || 'Failed to delete this save.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center">
      <PixelBox className="w-full p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-teal-300 text-[10px] tracking-[0.3em]">SAVE SELECT</p>
            <h1 className="text-xl md:text-2xl text-white uppercase tracking-widest drop-shadow-md">
              Game Lobby
            </h1>
            <p className="text-[10px] md:text-xs text-gray-300 leading-relaxed">
              Continue an existing journey or open a fresh timeline. You can keep up to {MAX_SLOTS} save slots.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-4">
              {listError && (
                <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center text-xs blink animate-pulse">
                  {listError}
                </div>
              )}

              {actionError && (
                <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center text-xs blink animate-pulse">
                  {actionError}
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-900 border-4 border-emerald-500 text-white p-3 text-center text-xs blink animate-pulse">
                  {successMessage}
                </div>
              )}

              {loading ? (
                <div className="text-center text-blue-300 text-xs blink py-12">LOADING SAVE FILES...</div>
              ) : games.length > 0 ? (
                games.map((game, index) => (
                  <SaveSlot
                    key={`${game.id}-${game.avatar}`}
                    game={game}
                    slotNumber={index + 1}
                    onPlay={handlePlay}
                    onRename={handleRename}
                    onDelete={setDeleteTarget}
                    busyAction={busyAction}
                  />
                ))
              ) : (
                <div className="border-4 border-dashed border-[#52525b] bg-black/50 p-8 text-center">
                  <p className="text-yellow-300 text-sm">NO SAVES FOUND</p>
                  <p className="mt-4 text-[10px] md:text-xs text-gray-300 leading-relaxed">
                    Start a new game to create your first timeline slot.
                  </p>
                </div>
              )}

              {!loading && emptySlots > 0 && (
                <div className="border-4 border-dashed border-[#334155] bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] md:text-xs text-gray-400 tracking-[0.2em]">
                    {emptySlots} EMPTY SLOT{emptySlots === 1 ? '' : 'S'} AVAILABLE
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="border-4 border-[#7c3aed] bg-[#14071f] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,0.7)]">
                <h2 className="text-sm md:text-base text-white uppercase tracking-widest">
                  New Journey
                </h2>
                <p className="mt-4 text-[10px] md:text-xs text-gray-300 leading-relaxed">
                  Pick a character name and start from the intro room. The API allows a maximum of {MAX_SLOTS} saves per user.
                </p>

                <form onSubmit={handleCreateGame} className="mt-6 flex flex-col gap-4">
                  <PixelInput
                    id="new-avatar"
                    label="Avatar Name:"
                    placeholder="SIR ISAAC MEWTON..."
                    value={newAvatar}
                    onChange={(event) => setNewAvatar(event.target.value)}
                    minLength={3}
                    maxLength={45}
                    required
                    disabled={isCreating || games.length >= MAX_SLOTS}
                  />

                  {createError && (
                    <div className="bg-red-900 border-4 border-red-500 text-white p-3 text-center text-xs blink animate-pulse">
                      {createError}
                    </div>
                  )}

                  <PixelButton
                    type="submit"
                    variant="primary"
                    className="w-full px-4 py-4 text-xs"
                    disabled={isCreating || games.length >= MAX_SLOTS}
                  >
                    {games.length >= MAX_SLOTS
                      ? '[ SAVE SLOTS FULL ]'
                      : isCreating
                        ? '[ OPENING TIMELINE... ]'
                        : '[ START NEW GAME ]'}
                  </PixelButton>
                </form>
              </div>


            </div>
          </div>
        </div>
      </PixelBox>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <PixelBox className="w-full max-w-md p-6 border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]">
            <h3 className="text-red-500 text-center text-lg uppercase tracking-widest drop-shadow-md">
              Delete Save?
            </h3>
            <p className="mt-5 text-center text-xs md:text-sm text-white leading-relaxed">
              Permanently remove <span className="text-yellow-300">{deleteTarget.avatar}</span> from slot memory?
            </p>
            <p className="mt-3 text-center text-[10px] text-gray-400">
              GAME ID: {deleteTarget.id}
            </p>

            <div className="mt-6 flex flex-col gap-4 md:flex-row">
              <PixelButton
                type="button"
                variant="secondary"
                className="w-full py-3 text-xs"
                onClick={() => setDeleteTarget(null)}
                disabled={busyAction?.type === 'delete'}
              >
                [ CANCEL ]
              </PixelButton>
              <PixelButton
                type="button"
                variant="danger"
                className="w-full py-3 text-xs"
                onClick={handleDelete}
                disabled={busyAction?.type === 'delete'}
              >
                {busyAction?.type === 'delete' ? '[ DELETING... ]' : '[ CONFIRM ]'}
              </PixelButton>
            </div>
          </PixelBox>
        </div>
      )}

      <div className="mt-8 text-neutral-600 text-xs text-center pt-4 w-full opacity-50">
        [ SAVE MANAGER ONLINE ]
      </div>
    </div>
  );
}
