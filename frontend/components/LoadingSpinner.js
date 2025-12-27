export default function LoadingSpinner({ size = 'medium' }) {
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-instagram-primary rounded-full spinner`}
        style={{ animation: 'spin 1s linear infinite' }}
      />
    </div>
  );
}
