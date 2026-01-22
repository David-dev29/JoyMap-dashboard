const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const Avatar = ({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate background color from name
  const getColor = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}
            ${getColor(name)}
            rounded-full
            flex items-center justify-center
            text-white font-medium
          `}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            w-3 h-3
            ${statusColors[status]}
            border-2 border-white dark:border-gray-800
            rounded-full
          `}
        />
      )}
    </div>
  );
};

const AvatarGroup = ({ children, max = 4, size = 'md', className = '' }) => {
  const avatars = Array.isArray(children) ? children : [children];
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visible.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-gray-800 rounded-full">
          {avatar}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizes[size]}
            bg-gray-200 dark:bg-gray-600
            text-gray-600 dark:text-gray-200
            rounded-full
            flex items-center justify-center
            font-medium
            ring-2 ring-white dark:ring-gray-800
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
