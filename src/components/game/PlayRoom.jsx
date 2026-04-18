const HOTSPOTS = [
  { id: 'door', label: 'mansion door', top: '52%', left: '18%' },
  { id: 'window', label: 'upstairs window', top: '24%', left: '63%' },
  { id: 'cat', label: 'mysterious cat', top: '74%', left: '71%' },
];
//these are hardcoded, can be removed once we implement functionality

export default function PlayRoom({ roomName, gameId, commandText }) {
  return (
    <section className="overflow-hidden border-[5px] border-[#7a5a2e] bg-black shadow-[0_0_0_4px_#221208]">
      <div className="relative aspect-[16/10] min-h-[260px] bg-black md:min-h-[420px]">
        <img
          src="/assets/rooms/start.png"
          alt={roomName}
          className="absolute inset-0 h-full w-full object-cover pixelated"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(11,6,2,0.14)_65%,rgba(0,0,0,0.3))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,219,102,0.12)_1px,transparent_1px)] [background-size:100%_4px]" />

        <div className="absolute left-3 top-3 border-2 border-[#f2cb69] bg-[#261507]/90 px-2 py-1 text-[9px] uppercase tracking-[0.24em] text-[#f7e1a6] md:left-4 md:top-4">
          {roomName}
        </div>


        {HOTSPOTS.map((hotspot) => (
          //no buttons will be needed either
          <button
            key={hotspot.id}
            type="button"
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ top: hotspot.top, left: hotspot.left }}
          >
            <span className="h-3 w-3 border-2 border-[#fff0a8] bg-[#cf7c1e] shadow-[0_0_0_2px_rgba(0,0,0,0.8)]" />
            <span className="hidden border border-[#f7e1a6] bg-[#1b0d04]/90 px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-[#f7e1a6] md:block">
              {hotspot.label}
            </span>
          </button>
        ))}
      </div>


    </section>
  );
}
