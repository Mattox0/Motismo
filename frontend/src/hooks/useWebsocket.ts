import { useEffect } from 'react';

import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IGameUser } from '@/types/model/IGameUser';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';
import { showToast } from '@/utils/toast';

export const useWebsocket = (code: string) => {
  const socket = useSocket();
  const { setMyUser } = useGame();

  useEffect(() => {
    if (!socket) return;
    socket?.on(IWebsocketEvent.CONNECT, () => {
      socket
        ?.emitWithAck(IWebsocketEvent.JOIN)
        .then(response => {
          if (response && response.error) {
            return showToast.error(response.error);
          }
        })
        .catch((error: Error) => {
          console.error(error);
        });
    });

    socket?.on(IWebsocketEvent.JOIN, (user: IGameUser) => {
      localStorage.setItem(code, JSON.stringify(user));
      console.log(user);
      setMyUser(user);
    });
  }, [socket]);
};
