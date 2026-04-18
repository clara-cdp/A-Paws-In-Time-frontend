import { useEffect, useRef, useState } from 'react';

function normalizeAssetPath(path) {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export default function PlayRoom({
  room,
  roomItems,
  commandText,
  onTargetSelect,
  onTargetHover,
  activeTargetId,
  isBusy,
}) {
  const frameRef = useRef(null);
  const mapRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const [svgMarkup, setSvgMarkup] = useState('');
  const [loadError, setLoadError] = useState('');
  const [transformStyle, setTransformStyle] = useState({
    width: '100%',
    height: '100%',
    transform: 'translate3d(0px, 0px, 0)',
  });

  const layoutType = room?.layout_type ?? 'all';

  useEffect(() => {
    let ignore = false;

    async function loadSvg() {
      if (!room?.image_url) {
        setSvgMarkup('');
        setLoadError('');
        return;
      }

      try {
        setLoadError('');
        const response = await fetch(normalizeAssetPath(room.image_url));
        if (!response.ok) {
          throw new Error(`Unable to load room map (${response.status}).`);
        }

        const text = await response.text();
        const normalizedMarkup = text.replaceAll('../assets/', '/assets/');
        if (!ignore) {
          setSvgMarkup(normalizedMarkup);
        }
      } catch (error) {
        if (!ignore) {
          setSvgMarkup('');
          setLoadError(error.message || 'Unable to load room map.');
        }
      }
    }

    loadSvg();

    return () => {
      ignore = true;
    };
  }, [room?.image_url]);

  useEffect(() => {
    if (!svgMarkup || !frameRef.current || !mapRef.current) {
      return undefined;
    }

    const frameElement = frameRef.current;
    const mapElement = mapRef.current;
    const svgElement = mapElement.querySelector('svg');

    if (!svgElement) {
      return undefined;
    }

    const state = dragStateRef.current;

    const clampAndCommit = () => {
      const frameWidth = frameElement.clientWidth;
      const frameHeight = frameElement.clientHeight;
      const minX = frameWidth - state.width;
      const minY = frameHeight - state.height;

      if (state.width > frameWidth) {
        state.x = Math.min(0, Math.max(state.x, minX));
      } else {
        state.x = (frameWidth - state.width) / 2;
      }

      if (state.height > frameHeight) {
        state.y = Math.min(0, Math.max(state.y, minY));
      } else {
        state.y = (frameHeight - state.height) / 2;
      }

      setTransformStyle({
        width: `${state.width}px`,
        height: `${state.height}px`,
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
      });
    };

    const calculateSize = () => {
      const viewBox = svgElement.viewBox?.baseVal;
      const originalWidth = viewBox?.width || 3000;
      const originalHeight = viewBox?.height || 2000;
      const ratio = originalWidth / originalHeight;
      const frameWidth = frameElement.clientWidth;
      const frameHeight = frameElement.clientHeight;

      if (layoutType === 'hor') {
        state.height = frameHeight;
        state.width = frameHeight * ratio;
      } else if (layoutType === 'ver') {
        state.width = frameWidth;
        state.height = frameWidth / ratio;
      } else {
        state.width = Math.max(frameWidth, originalWidth);
        state.height = Math.max(frameHeight, originalHeight);
      }

      state.x = (frameWidth - state.width) / 2;
      state.y = (frameHeight - state.height) / 2;
      clampAndCommit();
    };

    const handlePointerMove = (event) => {
      if (!state.isDragging) {
        return;
      }

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      if (layoutType === 'all' || layoutType === 'hor') {
        state.x += deltaX;
      }

      if (layoutType === 'all' || layoutType === 'ver') {
        state.y += deltaY;
      }

      state.startX = event.clientX;
      state.startY = event.clientY;
      clampAndCommit();
    };

    const handlePointerUp = () => {
      state.isDragging = false;
    };

    const handlePointerDown = (event) => {
      if (event.target.closest('[data-room-item-id]')) {
        return;
      }

      state.isDragging = true;
      state.startX = event.clientX;
      state.startY = event.clientY;
    };

    calculateSize();

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(calculateSize);
    resizeObserverRef.current.observe(frameElement);

    frameElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      resizeObserverRef.current?.disconnect();
      frameElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [svgMarkup, layoutType]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const svgElement = mapRef.current.querySelector('svg');
    if (!svgElement) {
      return;
    }

    const itemMap = new Map(roomItems.map((item) => [item.name_id, item]));

    svgElement.querySelectorAll('[id]').forEach((element) => {
      const item = itemMap.get(element.id);
      if (!item) {
        return;
      }

      element.dataset.roomItemId = String(item.id);
      element.dataset.baseFill = element.getAttribute('fill') || '';
      element.dataset.baseStroke = element.getAttribute('stroke') || '';
      element.style.cursor = isBusy ? 'progress' : 'pointer';
      element.style.opacity = item.is_visible ? '1' : '0';
      element.style.pointerEvents = item.is_visible ? 'auto' : 'none';
      element.style.transition = 'opacity 120ms ease';
      element.style.fill = item.is_visible ? 'rgba(255,255,255,0.001)' : 'transparent';
      element.style.stroke =
        item.id === activeTargetId && item.is_visible ? 'rgba(124, 197, 255, 0.95)' : 'transparent';
      element.style.strokeWidth = item.id === activeTargetId && item.is_visible ? '6px' : '0px';
      element.style.filter =
        item.id === activeTargetId ? 'drop-shadow(0 0 6px rgba(124, 197, 255, 0.95))' : '';
    });
  }, [roomItems, activeTargetId, isBusy, svgMarkup]);

  useEffect(() => {
    if (!mapRef.current) {
      return undefined;
    }

    const svgElement = mapRef.current.querySelector('svg');
    if (!svgElement) {
      return undefined;
    }

    const cleanupFns = [];

    roomItems.forEach((item) => {
      const targetElement = svgElement.getElementById
        ? svgElement.getElementById(item.name_id)
        : svgElement.querySelector(`#${CSS.escape(item.name_id)}`);

      if (!targetElement) {
        return;
      }

      const handleMouseEnter = () => {
        if (!item.is_visible) {
          return;
        }

        targetElement.style.stroke = 'rgba(242, 203, 105, 0.95)';
        targetElement.style.strokeWidth = '6px';
        targetElement.style.filter = 'drop-shadow(0 0 6px rgba(242, 203, 105, 0.85))';
        onTargetHover?.(item);
      };

      const handleMouseLeave = () => {
        targetElement.style.stroke =
          item.id === activeTargetId && item.is_visible ? 'rgba(124, 197, 255, 0.95)' : 'transparent';
        targetElement.style.strokeWidth = item.id === activeTargetId && item.is_visible ? '6px' : '0px';
        targetElement.style.filter =
          item.id === activeTargetId ? 'drop-shadow(0 0 6px rgba(124, 197, 255, 0.95))' : '';
        onTargetHover?.(null);
      };

      const handleClick = (event) => {
        if (isBusy || !item.is_visible) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        onTargetSelect?.(item);
      };

      const handlePointerDown = (event) => {
        event.stopPropagation();
      };

      targetElement.addEventListener('mouseenter', handleMouseEnter);
      targetElement.addEventListener('mouseleave', handleMouseLeave);
      targetElement.addEventListener('click', handleClick);
      targetElement.addEventListener('pointerdown', handlePointerDown);

      cleanupFns.push(() => {
        targetElement.removeEventListener('mouseenter', handleMouseEnter);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
        targetElement.removeEventListener('click', handleClick);
        targetElement.removeEventListener('pointerdown', handlePointerDown);
      });
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [roomItems, onTargetSelect, onTargetHover, isBusy, svgMarkup, activeTargetId]);

  return (
    <section className="overflow-hidden border-[5px] border-[#7a5a2e] bg-black shadow-[0_0_0_4px_#221208]">
      <div
        ref={frameRef}
        className="relative aspect-[16/10] min-h-[260px] overflow-hidden bg-black md:min-h-[420px]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(11,6,2,0.14)_65%,rgba(0,0,0,0.3))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,219,102,0.12)_1px,transparent_1px)] [background-size:100%_4px]" />

        {room && (
          <div className="absolute left-3 top-3 z-20 border-2 border-[#f2cb69] bg-[#261507]/90 px-2 py-1 text-[9px] uppercase tracking-[0.24em] text-[#f7e1a6] md:left-4 md:top-4">
            {room.name}
          </div>
        )}

        {svgMarkup && (
          <div
            ref={mapRef}
            className="absolute left-0 top-0 select-none touch-none [&>svg]:h-full [&>svg]:w-full"
            style={transformStyle}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        )}

        {!svgMarkup && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.24em] text-[#f7e1a6] md:text-xs">
            Loading room...
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.2em] text-red-300 md:text-xs">
            {loadError}
          </div>
        )}
      </div>

      <div className="border-t-[5px] border-[#7a5a2e] bg-[#100713] px-3 py-2 text-center text-[10px] text-[#6f8ff7] md:px-4 md:text-xs">
        {commandText}
      </div>
    </section>
  );
}
