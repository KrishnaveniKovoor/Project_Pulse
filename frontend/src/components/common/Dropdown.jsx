import { useEffect, useRef, useState } from 'react';

const Dropdown = ({ trigger, items = [], align = 'right', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>

      {open && (
        <div
          className={`
            absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] animate-slide-in
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, i) =>
            item.separator ? (
              <hr key={i} className="my-1 border-gray-100" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                disabled={item.disabled}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
