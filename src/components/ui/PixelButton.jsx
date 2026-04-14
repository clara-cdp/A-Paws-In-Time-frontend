export default function PixelButton({ children, variant = 'primary', className = '', ...props }) {
  const btnClass = variant === 'primary' ? 'pixel-btn' : 'pixel-btn-secondary';
  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
