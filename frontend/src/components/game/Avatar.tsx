import { FC } from 'react';

import { IGameUser } from '@/types/model/IGameUser';

interface IAvatarProps {
  user: IGameUser;
  mode: 'lobby' | 'other';
}

export const Avatar: FC<IAvatarProps> = ({ user, mode }) => {
  return (
    <div className="lobby-participant" key={user.id}>
      <div className="lobby-participant-avatar">
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={user.name}
          width={56}
          height={56}
          className="rounded-sm object-cover"
        />
      </div>
      {mode === 'lobby' && <div className="lobby-participant-name">{user.name}</div>}
    </div>
  );
};
