import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import PlayRoom from '../components/game/PlayRoom';
import ActionVerbMenu from '../components/game/ActionVerbMenu';
import PocketItems from '../components/game/PocketItems';
import GameRoomMenu from '../components/game/GameRoomMenu';

const FALLBACK_VERBS = ['LOOK AT', 'USE', 'PICK UP', 'GO TO', 'OPEN', 'RESCUE', 'PULL', 'PUSH'];

export default function GameRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [activeAction, setActiveAction] = useState('LOOK AT');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [game, setGame] = useState(null);
  const [verbs, setVerbs] = useState(FALLBACK_VERBS);
  const [message, setMessage] = useState('Loading room...');
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const roomItems = useMemo(() => game?.current_room?.items ?? [], [game]);

  useEffect(() => {
    let ignore = false;

    async function loadGame() {
      if (!id) {
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const gamePromise = api.get(`/games/${id}`);
        const metadataPromise = api.get('/metadata').catch(() => null);
        const [gameResponse, metadataResponse] = await Promise.all([gamePromise, metadataPromise]);

        if (ignore) {
          return;
        }

        const nextGame = gameResponse.data?.game;
        const isIntroRoom = nextGame?.current_room?.name === 'Intro';
        setGame(nextGame);
        setSelectedItem(null);
        setSelectedTarget(null);
        setHoveredTarget(null);
        setMessage(`Entered ${nextGame?.current_room?.name || 'room'}.`);
        if (isIntroRoom) {
          setActiveAction('GO TO');
        }

        const nextVerbs = metadataResponse?.data?.verbs;
        if (Array.isArray(nextVerbs) && nextVerbs.length > 0) {
          setVerbs(nextVerbs);
          setActiveAction((current) => {
            if (isIntroRoom && nextVerbs.includes('GO TO')) {
              return 'GO TO';
            }

            return nextVerbs.includes(current) ? current : nextVerbs[0];
          });
        }
      } catch (error) {
        if (ignore) {
          return;
        }

        console.error(error);
        const nextError = error.response?.data?.message || 'Unable to load this save.';
        setLoadError(nextError);
        setMessage(nextError);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadGame();

    return () => {
      ignore = true;
    };
  }, [id]);

  const commandText = useMemo(() => {
    if (loadError) {
      return loadError;
    }

    if (hoveredTarget) {
      if (activeAction === 'USE' && selectedItem?.name_id) {
        return `${activeAction} ${selectedItem.name_id} with ${hoveredTarget.name_id}`;
      }

      return `${activeAction} ${hoveredTarget.name_id}`;
    }

    if (message && !selectedTarget && !(activeAction === 'USE' && selectedItem)) {
      return message;
    }

    const targetLabel = selectedTarget?.name_id || game?.current_room?.name || '...';
    const itemLabel = selectedItem?.name_id;

    if (activeAction === 'USE' && itemLabel) {
      return `${activeAction} ${itemLabel} with ${targetLabel}`;
    }

    return `${activeAction} ${targetLabel}`;
  }, [activeAction, game, hoveredTarget, loadError, message, selectedItem, selectedTarget]);

  const handleTargetSelect = async (target) => {
    if (!game || !id) {
      return;
    }

    setSelectedTarget(target);
    setMessage('');
    setLoadError('');

    try {
      setIsActing(true);
      const payload = {
        verb: activeAction,
        target_id: target.id,
      };

      if (activeAction === 'USE' && selectedItem?.id) {
        payload.item_id = selectedItem.id;
      }

      const response = await api.post(`/games/${id}/actions`, payload);
      setGame(response.data?.game);
      setMessage(response.data?.message || 'Action complete.');
      setSelectedItem(null);
      setSelectedTarget(null);
      setHoveredTarget(null);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'That action failed.');
      setSelectedTarget(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem((current) => (current?.id === item.id ? null : item));
    setSelectedTarget(null);
    setHoveredTarget(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-[#050108] px-2 py-3 text-white md:px-4 md:py-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-2 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.24em] text-[#9fa0d3] md:mb-3 md:text-[10px]">
          <span>A Paws In Time</span>
          <span>Session {id}</span>
        </div>

        <div className="overflow-hidden border-[6px] border-[#221008] bg-[#09020d] shadow-[0_0_0_4px_#000,0_18px_40px_rgba(0,0,0,0.55)]">
          <PlayRoom
            room={game?.current_room}
            roomItems={roomItems}
            commandText={commandText}
            onTargetSelect={handleTargetSelect}
            onTargetHover={setHoveredTarget}
            activeTargetId={selectedTarget?.id}
            isBusy={isLoading || isActing}
          />

          <div className="grid gap-[5px] border-t-[5px] border-[#221008] bg-[#050108] p-[5px] lg:grid-cols-[1.15fr_1.45fr_0.7fr]">
            <ActionVerbMenu
              actions={verbs}
              activeAction={activeAction}
              onSelectAction={(verb) => {
                setActiveAction(verb);
                setSelectedItem(null);
                setSelectedTarget(null);
                setHoveredTarget(null);
                setMessage('');
              }}
            />
            <PocketItems
              items={game?.pocket ?? []}
              selectedItemId={selectedItem?.id}
              onSelectItem={handleSelectItem}
            />
            <GameRoomMenu
              musicEnabled={musicEnabled}
              onToggleMusic={() => setMusicEnabled((current) => !current)}
              onQuit={() => navigate('/games')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
