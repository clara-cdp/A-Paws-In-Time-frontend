export default function PixelButton({ children, variant = 'primary', className = '', ...props }) {
  const variantClasses = {
    primary: 'pixel-btn pixel-btn-primary',
    secondary: 'pixel-btn pixel-btn-secondary',
    danger: 'pixel-btn pixel-btn-danger',
  };

  const btnClass = variantClasses[variant] || variantClasses.primary;

  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
