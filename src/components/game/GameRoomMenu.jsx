import useGameMusic from '../../hooks/useGameMusic';

export default function GameRoomMenu({ onQuit }) {
  const { musicEnabled, toggleMusic } = useGameMusic();

  return (
    <div className="game-room-menu grid h-full w-full grid-cols-1 gap-1 border-[3px] border-[#94a3b8] bg-[#0f172a] p-1 shadow-[0_4px_0_0_rgba(0,0,0,0.8)] sm:grid-cols-2 lg:grid-cols-1">
      <button
        type="button"
        onClick={onQuit}
        className="whitespace-nowrap game-room-menu-button game-room-menu-quit flex w-full items-center justify-center bg-[#1e293b] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[#e2e8f0] transition hover:bg-[#334155] hover:text-[#fcd34d] md:px-3 md:text-[9px]"
      >
        [{'\u00A0'}Quit{'\u00A0'}]
      </button>
      <button
        type="button"
        onClick={toggleMusic}
        aria-pressed={musicEnabled}
        className={`game-room-menu-button game-room-menu-music flex w-full items-center justify-center px-2.5 py-1.5 
          text-[8px] uppercase tracking-[0.16em] transition md:px-3 md:text-[9px] ${musicEnabled
            ? 'game-room-menu-music-on bg-[#0f766e] text-[#ecfeff] hover:bg-[#0d9488]'
            : 'game-room-menu-music-off bg-[#1e293b] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#fcd34d]'
          }`}
      >
        Music [{'\u00A0'}{musicEnabled ? 'On' : 'Off'}{'\u00A0'}]
      </button>
    </div>
  );
}
