import { useEffect, useMemo, useRef, useState } from 'react';

function normalizeAssetPath(path) {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export default function PlayRoom({
  room,
  roomItems,
  messageText,
  onTargetSelect,
  isBusy,
}) {
  const frameRef = useRef(null);
  const mapRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const viewportKeyRef = useRef(null);
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
  const [isDragging, setIsDragging] = useState(false);
  const [transformStyle, setTransformStyle] = useState({
    width: '100%',
    height: '100%',
    transform: 'translate3d(0px, 0px, 0)',
  });

  const layoutType = room?.layout_type ?? 'all';
  const viewportKey = `${room?.id ?? 'none'}:${room?.image_url ?? ''}:${layoutType}`;
  const roomItemById = useMemo(
    () => new Map(roomItems.map((item) => [String(item.id), item])),
    [roomItems]
  );

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

  const processedSvgMarkup = useMemo(() => {
    if (!svgMarkup) {
      return '';
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const svgElement = document.querySelector('svg');

    if (!svgElement) {
      return svgMarkup;
    }

    const roomItemBySlug = new Map(roomItems.map((item) => [item.name_id, item]));

    svgElement.querySelectorAll('[id]').forEach((element) => {
      const elementId = element.getAttribute('id');
      if (!elementId) {
        return;
      }

      if (elementId === 'bg') {
        element.removeAttribute('data-room-item-id');
        element.dataset.roomVisible = 'true';
        element.style.pointerEvents = 'none';
        return;
      }

      const roomItem = roomItemBySlug.get(elementId);
      const isVisible = Boolean(roomItem?.is_visible);

      if (!roomItem || !isVisible) {
        element.removeAttribute('data-room-item-id');
        element.dataset.roomVisible = 'false';
        element.style.display = 'none';
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        element.style.pointerEvents = 'none';
        return;
      }

      element.dataset.roomVisible = 'true';
      element.dataset.roomItemId = String(roomItem.id);
      element.style.display = '';
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.pointerEvents = isBusy ? 'none' : 'auto';
      element.style.cursor = isBusy ? 'progress' : 'pointer';

      if (element.tagName.toLowerCase() !== 'image') {
        const fill = element.getAttribute('fill');
        if (!fill || fill === 'transparent' || fill === 'none') {
          element.style.fill = 'rgba(255,255,255,0.001)';
        }
      }
    });

    return new XMLSerializer().serializeToString(svgElement);
  }, [isBusy, roomItems, svgMarkup]);

  useEffect(() => {
    if (!processedSvgMarkup || !frameRef.current || !mapRef.current) {
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

    const calculateSize = (shouldRecenter = false) => {
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

      if (shouldRecenter) {
        state.x = (frameWidth - state.width) / 2;
        state.y = (frameHeight - state.height) / 2;
      }

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
      setIsDragging(false);
    };

    const handlePointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest('[data-room-item-id]')) {
        return;
      }

      state.isDragging = true;
      setIsDragging(true);
      state.startX = event.clientX;
      state.startY = event.clientY;
    };

    const shouldRecenter = viewportKeyRef.current !== viewportKey;

    calculateSize(shouldRecenter);
    viewportKeyRef.current = viewportKey;

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(() => calculateSize(false));
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
  }, [layoutType, processedSvgMarkup, viewportKey]);

  useEffect(() => {
    if (!mapRef.current) {
      return undefined;
    }

    const mapElement = mapRef.current;

    const getRoomItemFromEvent = (event) => {
      if (!(event.target instanceof Element)) {
        return null;
      }

      const targetElement = event.target.closest('[data-room-item-id]');
      if (!targetElement) {
        return null;
      }

      const roomItemId = targetElement.getAttribute('data-room-item-id');
      return roomItemId ? roomItemById.get(roomItemId) ?? null : null;
    };

    const handlePointerDown = (event) => {
      if (!getRoomItemFromEvent(event)) {
        return;
      }

      event.stopPropagation();
    };

    const handleClick = (event) => {
      const roomItem = getRoomItemFromEvent(event);
      if (!roomItem || isBusy) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onTargetSelect?.(roomItem);
    };

    mapElement.addEventListener('pointerdown', handlePointerDown);
    mapElement.addEventListener('click', handleClick);

    return () => {
      mapElement.removeEventListener('pointerdown', handlePointerDown);
      mapElement.removeEventListener('click', handleClick);
    };
  }, [isBusy, onTargetSelect, processedSvgMarkup, roomItemById]);

  return (
    <section className="overflow-hidden border-[5px] border-[#7a5a2e] bg-black shadow-[0_0_0_4px_#221208]">
      <style>{`
        .playroom-map [data-room-visible="false"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        .playroom-map [data-room-visible="true"] {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
      <div
        ref={frameRef}
        className={`relative aspect-[16/10] min-h-[260px] overflow-hidden bg-black md:min-h-[420px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(11,6,2,0.14)_65%,rgba(0,0,0,0.3))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,219,102,0.12)_1px,transparent_1px)] [background-size:100%_4px]" />

        {room && (
          <div className="absolute left-3 top-3 z-20 border-2 border-[#f2cb69] bg-[#261507]/90 px-2 py-1 text-[9px] uppercase tracking-[0.24em] text-[#f7e1a6] md:left-4 md:top-4">
            {room.name}
          </div>
        )}

        {processedSvgMarkup && (
          <div
            ref={mapRef}
            className="playroom-map absolute left-0 top-0 select-none touch-none [&>svg]:h-full [&>svg]:w-full"
            style={transformStyle}
            dangerouslySetInnerHTML={{ __html: processedSvgMarkup }}
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

      <div className="min-h-[36px] border-t-[5px] border-[#7a5a2e] bg-[#100713] px-3 py-2 text-center text-[10px] text-[#6f8ff7] md:min-h-[42px] md:px-4 md:text-xs">
        {messageText}
      </div>
    </section>
  );
}
