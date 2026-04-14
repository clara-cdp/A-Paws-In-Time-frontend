export default function PixelInput({ label, id, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label htmlFor={id} className="text-teal-300 text-shadow-retro">{label}</label>}
      <input 
        id={id}
        className="pixel-input p-3 w-full"
        {...props}
      />
    </div>
  );
}
