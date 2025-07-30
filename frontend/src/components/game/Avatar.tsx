import { FC } from 'react';

interface IAvatarProps {
  avatar: string;
  name?: string;
  mode: 'lobby' | 'other' | 'current';
}

export const Avatar: FC<IAvatarProps> = ({ avatar, name, mode }) => {
  return (
    <div className={`lobby-participant ${mode === 'current' ? 'lobby-participant--current' : ''}`}>
      <div className="lobby-participant-avatar">
        <img
          src={avatar || '/default-avatar.png'}
          alt={name}
          width={56}
          height={56}
          className="rounded-sm object-cover"
        />
      </div>
      {mode === 'lobby' && <div className="lobby-participant-name">{name}</div>}
    </div>
  );
};
