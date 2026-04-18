const DEFAULT_ACTIONS = ['Give', 'Open', 'Close', 'Pick up', 'Look at', 'Talk to', 'Use', 'Push', 'Pull'];
//check ENUMS!!
export default function ActionVerbMenu({
  actions = DEFAULT_ACTIONS,
  activeAction = 'Look at',
  onSelectAction,
}) {
  return (
    <section className="border-[5px] border-[#23101f] bg-[#130515] p-3 shadow-[0_0_0_4px_#050207] md:p-4">
      <div className="grid grid-cols-3 gap-x-3 gap-y-2 md:gap-x-4 md:gap-y-3">
        {actions.map((action) => {
          const isActive = action === activeAction;

          return (
            <button
              key={action}
              type="button"
              onClick={() => onSelectAction?.(action)}
              className={`text-left text-sm uppercase leading-none md:text-[22px] ${isActive ? 'text-[#6cb5ff]' : 'text-[#b13fd5] hover:text-[#ff92f2]'
                }`}
            >
              {action}
            </button>
          );
        })}
      </div>
    </section>
  );
}
