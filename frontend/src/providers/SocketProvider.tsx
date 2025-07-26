import { useParams } from 'next/navigation';
import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { IPlayerData } from '@/app/game/[code]/page';

type SocketType = Socket | null;

const SocketContext = createContext<SocketType>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

interface ISocketProviderProperties {
  children: ReactNode;
  player: IPlayerData;
}

export const SocketProvider: React.FC<ISocketProviderProperties> = ({ children, player }) => {
  const [socket, setSocket] = useState<SocketType>(null);
  const { code } = useParams();

  useEffect(() => {
    if (!code) return;

    console.log(player);

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
      query: {
        code,
        userId: player.id,
        name: player.name,
        avatar: player.avatar,
        externalId: player.externalId,
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [code]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
