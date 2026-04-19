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
    if (isLoading || isActing) {
      return;
    }

    if (activeAction === 'LOOK AT') {
      handleTargetSelect(item);
      return;
    }

    setSelectedItem((current) => (current?.id === item.id ? null : item));
  };

  return (
    <main className="game-room-page min-h-screen w-full bg-[#000000] px-2 py-3 text-white md:px-4 md:py-4">
      <div className="game-room-layout w-full">
        <section className="game-room-shell relative grid h-[calc(100vh-1.5rem)] w-full min-h-0 grid-rows-[minmax(0,7fr)_minmax(0,3fr)] overflow-hidden border-[4px] border-[#94a3b8] bg-[#020617] shadow-[0_6px_0_0_rgba(0,0,0,0.85)] md:h-[calc(100vh-2rem)] lg:grid-rows-[minmax(0,8fr)_minmax(0,2fr)]">
          <PlayRoom
            room={game?.current_room}
            roomItems={roomItems}
            messageText={message}
            onTargetSelect={handleTargetSelect}
            isBusy={isLoading || isActing}
          />

          <div className="game-room-bottom-bar grid min-h-0 gap-[5px] border-t-[4px] border-[#94a3b8] bg-[#020617] p-[5px] lg:grid-cols-[1.05fr_1.95fr]">
            <div className="game-room-action-column grid min-h-0 grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-stretch gap-[5px] lg:grid-cols-1">
              <ActionVerbMenu
                actions={verbs}
                activeAction={activeAction}
                onSelectAction={(verb) => {
                  setActiveAction(verb);
                  setSelectedItem(null);
                }}
              />
              <GameRoomMenu onQuit={() => navigate('/games')} />
            </div>

            <div className="game-room-pocket-column min-h-0">
              <PocketItems
                avatarName={game?.avatar ?? 'Player'}
                items={game?.pocket ?? []}
                selectedItemId={selectedItem?.id}
                onSelectItem={handleSelectItem}
                isBusy={isLoading || isActing}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
