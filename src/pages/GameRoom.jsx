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
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const roomItems = useMemo(() => game?.current_room?.items ?? [], [game]);
  const verbs = FALLBACK_VERBS;

  useEffect(() => {
    let ignore = false;

    async function loadGame() {
      if (!id) {
        return;
      }

      setIsLoading(true);

      try {
        const gameResponse = await api.get(`/games/${id}`);

        if (ignore) {
          return;
        }

        const nextGame = gameResponse.data?.game;
        setGame(nextGame);
        setSelectedItem(null);
        setMessage('');
      } catch (error) {
        if (ignore) {
          return;
        }

        console.error(error);
        setMessage(error.response?.data?.message || 'Unable to load this save.');
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

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage('');
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  const handleTargetSelect = async (target) => {
    if (!game || !id) {
      return;
    }

    setMessage('');

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
      const refreshResponse = await api.get(`/games/${id}`);
      const nextGame = refreshResponse.data?.game ?? response.data?.game;

      setGame(nextGame);
      setMessage(response.data?.message || '');
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'That action failed.');
    } finally {
      setIsActing(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem((current) => (current?.id === item.id ? null : item));
  };

  return (
    <div className="min-h-screen w-full bg-[#050108] px-2 py-3 text-white md:px-4 md:py-4">
      <div className="mx-auto w-full max-w-6xl">

        <div className="overflow-hidden border-[6px] border-[#221008] bg-[#09020d] shadow-[0_0_0_4px_#000,0_18px_40px_rgba(0,0,0,0.55)]">
          <PlayRoom
            room={game?.current_room}
            roomItems={roomItems}
            messageText={message}
            onTargetSelect={handleTargetSelect}
            isBusy={isLoading || isActing}
          />

          <div className="grid gap-[5px] border-t-[5px] border-[#221008] bg-[#050108] p-[5px] lg:grid-cols-[1.15fr_1.45fr_0.7fr]">
            <ActionVerbMenu
              actions={verbs}
              activeAction={activeAction}
              onSelectAction={(verb) => {
                setActiveAction(verb);
                setSelectedItem(null);
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
