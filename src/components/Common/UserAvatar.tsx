import React from 'react';
import { UserStatus } from '../../types';

interface UserAvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: UserStatus;
  isSpeaking?: boolean;
  className?: string;
  showStatusIndicator?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 ring-1',
  sm: 'w-2.5 h-2.5 ring-2',
  md: 'w-3.5 h-3.5 ring-[2.5px]',
  lg: 'w-4 h-4 ring-[3px]',
  xl: 'w-5 h-5 ring-[3.5px]',
  '2xl': 'w-6 h-6 ring-4',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  size = 'md',
  status,
  isSpeaking = false,
  className = '',
  showStatusIndicator = true,
}) => {
  const getStatusBadge = () => {
    if (!status || !showStatusIndicator) return null;

    const baseStatusClass = `absolute -bottom-0.5 -right-0.5 rounded-full ring-[#1e1f22] flex items-center justify-center ${statusSizeClasses[size]}`;

    switch (status) {
      case 'online':
        return <span className={`${baseStatusClass} bg-[#23a55a]`} title="Online (سەرهێڵ)" />;
      case 'idle':
        return (
          <span className={`${baseStatusClass} bg-[#f0b232] overflow-hidden`} title="Idle / Away (بێکار)">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e1f22] -translate-x-0.5 -translate-y-0.5" />
          </span>
        );
      case 'dnd':
        return (
          <span className={`${baseStatusClass} bg-[#f23f43]`} title="Do Not Disturb (بێزارم مەکە)">
            <span className="w-1.5 h-0.5 bg-white rounded-full" />
          </span>
        );
      case 'offline':
      default:
        return (
          <span className={`${baseStatusClass} bg-[#80848e] ring-[#1e1f22] flex items-center justify-center`} title="Offline / Invisible (نادیار)">
            <span className="w-1 h-1 rounded-full bg-[#1e1f22]" />
          </span>
        );
    }
  };

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      <img
        src={src || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover transition-all ${
          isSpeaking
            ? 'speaking-ring ring-2 ring-[#23a559]'
            : 'ring-1 ring-white/10'
        }`}
        onError={(e) => {
          // Fallback image if broken
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
        }}
      />
      {getStatusBadge()}
    </div>
  );
};
