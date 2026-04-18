import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayRoom from '../components/game/PlayRoom';
import ActionVerbMenu from '../components/game/ActionVerbMenu';
import PocketItems from '../components/game/PocketItems';
import GameRoomMenu from '../components/game/GameRoomMenu';

export default function GameRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [activeAction, setActiveAction] = useState('Look at');
  const [selectedItem, setSelectedItem] = useState(null);

  const commandText = `${activeAction}${selectedItem ? ` ${selectedItem.label}` : ' mysterious mansion'}`;

  return (
    <div className="min-h-screen w-full bg-[#050108] px-2 py-3 text-white md:px-4 md:py-4">
      <div className="mx-auto w-full max-w-6xl">


        <div className="overflow-hidden border-[6px] border-[#221008] bg-[#09020d] shadow-[0_0_0_4px_#000,0_18px_40px_rgba(0,0,0,0.55)]">
          <PlayRoom roomName="Mansion Grounds" gameId={id} commandText={commandText} />

          <div className="grid gap-[5px] border-t-[5px] border-[#221008] bg-[#050108] p-[5px] lg:grid-cols-[1.15fr_1.45fr_0.7fr]">
            <ActionVerbMenu activeAction={activeAction} onSelectAction={setActiveAction} />
            <PocketItems
              selectedItemId={selectedItem?.id}
              onSelectItem={(item) =>
                setSelectedItem((current) => (current?.id === item.id ? null : item))
              }
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
