export default function PixelBox({ children, className = '' }) {
  return (
    <div className={`pixel-box ${className}`}>
      {children}
    </div>
  );
}
