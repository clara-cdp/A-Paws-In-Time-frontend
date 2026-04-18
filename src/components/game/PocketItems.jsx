const DEFAULT_ITEMS = [
  { id: 'magnifying-glass', label: 'Lens', image: '/assets/items/magnifying_glass.png' },
  { id: 'gear', label: 'Gear', image: '/assets/items/gear.png' },
  { id: 'key', label: 'Key', image: '/assets/items/key.png' },
  { id: 'crowbar', label: 'Crowbar', image: '/assets/items/crowbar.png' },
  { id: 'jar', label: 'Jar', image: '/assets/items/jar.png' },
  { id: 'seed', label: 'Seed', image: '/assets/items/seed.png' },
];
//remove all this harcoded material 
// no names just the objects

export default function PocketItems({ items = DEFAULT_ITEMS, selectedItemId, onSelectItem }) {
  return (
    <section className="border-[5px] border-[#23101f] bg-[#130515] p-3 shadow-[0_0_0_4px_#050207] md:p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase md:mb-4">
        <span className="text-[#8579c8]">Pocket</span>
        <span className="text-[#5d8cf5]">{items.length} Items</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item)}
              className={`flex min-h-20 flex-col items-center justify-center border-[3px] px-2 py-3 transition md:min-h-24 ${isSelected
                ? 'border-[#8ec6ff] bg-[#2530a6]'
                : 'border-[#30214d] bg-[#09020d] hover:border-[#6e52a6] hover:bg-[#1a0720]'
                }`}
            >
              <img
                src={item.image}
                alt={item.label}
                className="h-8 w-8 object-contain pixelated md:h-10 md:w-10"
              />
              <span className="mt-2 text-center text-[8px] uppercase leading-tight text-[#c9d7ff] md:text-[9px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
