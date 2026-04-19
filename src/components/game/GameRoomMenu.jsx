import useGameMusic from '../../hooks/useGameMusic';
import PixelButton from '../ui/PixelButton';

export default function GameRoomMenu({ onQuit }) {
  const { musicEnabled, toggleMusic } = useGameMusic();

  return (
    <div className="game-room-menu grid h-full w-full grid-cols-1 gap-1 border-[3px] border-[#94a3b8] bg-[#0f172a] p-1 shadow-[0_4px_0_0_rgba(0,0,0,0.8)] sm:grid-cols-2 lg:grid-cols-1">
      <PixelButton
        type="button"
        onClick={onQuit}
        variant="danger"
        className="game-room-menu-button game-room-menu-quit flex w-full items-center justify-center whitespace-nowrap px-2.5 py-1.5 text-[9px] tracking-[0.16em] md:px-3 md:text-[9px]"
      >
        [ Quit ]
      </PixelButton>
      <PixelButton
        type="button"
        onClick={toggleMusic}
        aria-pressed={musicEnabled}
        variant={musicEnabled ? 'primary' : 'secondary'}
        className="game-room-menu-button game-room-menu-music flex w-full items-center justify-center px-2.5 py-1.5 text-[8px] tracking-[0.16em] md:px-3 md:text-[9px]"
      >
        Music [ {musicEnabled ? 'On' : 'Off'} ]
      </PixelButton>
    </div>
  );
}
