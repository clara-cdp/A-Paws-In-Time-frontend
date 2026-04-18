export default function GameRoomMenu({ musicEnabled, onToggleMusic, onQuit }) {
  return (
    <section className="border-[5px] border-[#23101f] bg-[#130515] p-3 shadow-[0_0_0_4px_#050207] md:p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        <button
          type="button"
          onClick={onQuit}
          className="border-[3px] border-[#4e335f] bg-[#14071f] px-3 py-3 text-[10px] uppercase text-[#c79cff] transition hover:bg-[#2b0a21] hover:text-[#ffb3c0] md:text-xs"
        >
          Quit
        </button>
        <button
          type="button"
          onClick={onToggleMusic}
          aria-pressed={musicEnabled}
          className={`border-[3px] px-3 py-3 text-[10px] uppercase transition md:text-xs ${musicEnabled
              ? 'border-[#5d8cf5] bg-[#142469] text-[#dbe7ff] hover:bg-[#1c3290]'
              : 'border-[#4e335f] bg-[#14071f] text-[#c79cff] hover:bg-[#251129]'
            }`}
        >
          Music {musicEnabled ? 'On' : 'Off'}
        </button>
      </div>
    </section>
  );
}

//this will be a small pill on the top right on small devices
