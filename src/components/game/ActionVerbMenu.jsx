const DEFAULT_ACTIONS = ['LOOK AT', 'USE', 'PICK UP', 'GO TO', 'OPEN', 'RESCUE', 'PULL', 'PUSH'];

export default function ActionVerbMenu({
  actions = DEFAULT_ACTIONS,
  activeAction = 'LOOK AT',
  onSelectAction,
}) {
  return (
    <section className="action-verb-menu h-full border-[4px] border-[#94a3b8] bg-[#0f172a] p-2.5 shadow-[0_4px_0_0_rgba(0,0,0,0.8)] md:p-3">
      <div className="action-verb-grid grid grid-cols-2 gap-x-2.5 gap-y-1.5 md:gap-x-3 md:gap-y-2">
        {actions.map((action) => {
          const isActive = action === activeAction;

          return (
            <button
              key={action}
              type="button"
              onClick={() => onSelectAction?.(action)}
              className={`action-verb-button text-left text-[10px] uppercase leading-none transition md:text-[15px] lg:text-[16px] ${isActive ? 'action-verb-button-active text-[#2dd4bf]' : 'action-verb-button-idle text-[#e2e8f0] hover:text-[#fcd34d]'
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
