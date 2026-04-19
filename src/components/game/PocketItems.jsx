function normalizeAssetPath(path) {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export default function PocketItems({
  avatarName = 'Player',
  items = [],
  selectedItemId,
  onSelectItem,
  isBusy = false,
}) {
  return (
    <section className="pocket-items-panel h-full border-[4px] border-[#94a3b8] bg-[#0f172a] p-2 shadow-[0_4px_0_0_rgba(0,0,0,0.8)] md:p-3">
      <div className="pocket-items-title mb-1 text-[9px] uppercase md:text-[12px]">
        <span className="text-[#2dd4bf]">{avatarName}&apos;s Pocket</span>
      </div>

      {items.length > 0 ? (
        <div className="pocket-items-grid grid grid-cols-3 gap-y-1 sm:grid-cols-6">
          {items.map((item) => {
            const isSelected = item.id === selectedItemId;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isBusy}
                onClick={() => onSelectItem?.(item)}
                className={`pocket-items-button flex min-h-20 flex-col items-center justify-center bg-transparent px-1 py-2 transition duration-150 
                  disabled:cursor-progress disabled:opacity-70 md:min-h-24 md:px-1.5 md:py-2 ${isSelected
                    ? 'scale-[1.14]'
                    : 'hover:scale-[1.1]'
                  }`}
              >
                <img
                  src={normalizeAssetPath(item.image_url)}
                  alt={item.name_id}
                  className={`pocket-items-image h-16 w-16 object-contain transition duration-150 md:h-20 md:w-20 ${isSelected
                    ? 'drop-shadow-[0_0_10px_rgba(45,212,191,0.65)]'
                    : 'drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]'
                    }`}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="pocket-items-empty flex min-h-24 items-center justify-center border-[3px] border-dashed border-[#475569] bg-[#020617] px-3 text-center text-[9px] uppercase tracking-[0.2em] text-[#94a3b8] md:text-[10px]">
          Empty pocket
        </div>
      )}
    </section>
  );
}
