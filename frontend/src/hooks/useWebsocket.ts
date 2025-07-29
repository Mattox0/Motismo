import { useEffect } from 'react';

import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';
import { IGameUser } from '@/types/model/IGameUser';
import { IQuestion } from '@/types/model/IQuestion';
import { IGameStatus } from '@/types/websockets/IGameStatus';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';
import { showToast } from '@/utils/toast';

export const useWebsocket = (code: string) => {
  const socket = useSocket();
  const {
    setMyUser,
    setUsers,
    setStatus,
    setCurrentQuestion,
    setTimeLeft,
    setAnswerStatistics,
    setAnswerCount,
    setTimerFinished,
  } = useGame();

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
      setMyUser(user);
    });

    socket?.on(IWebsocketEvent.ERROR, (error: string) => {
      showToast.error(error);
    });

    socket?.on(IWebsocketEvent.STATUS, (status: IGameStatus) => {
      setStatus(status);
    });

    socket.on(IWebsocketEvent.MEMBERS, users => {
      setUsers(users);
    });

    socket.on(IWebsocketEvent.QUESTION_DATA, (question: IQuestion) => {
      setCurrentQuestion(question);
    });

    socket.on(
      IWebsocketEvent.TIMER,
      (data: {
        timeLeft: number;
        type: string;
        finished?: boolean;
        answered?: number;
        total?: number;
        allAnswered?: boolean;
      }) => {
        setTimeLeft(data.timeLeft);
        setAnswerCount({ answered: data.answered || 0, total: data.total || 0 });
        setTimerFinished(data.finished || false);
      }
    );

    socket.on(IWebsocketEvent.RESULTS, (statistics: IAnswerStatistics) => {
      setAnswerStatistics(statistics);
    });

    return () => {
      socket.off(IWebsocketEvent.CONNECT);
      socket.off(IWebsocketEvent.ERROR);
      socket.off(IWebsocketEvent.STATUS);
      socket.off(IWebsocketEvent.JOIN);
      socket.off(IWebsocketEvent.MEMBERS);
      socket.off(IWebsocketEvent.QUESTION_DATA);
      socket.off(IWebsocketEvent.TIMER);
      socket.off(IWebsocketEvent.RESULTS);
    };
  }, [
    socket,
    setMyUser,
    setUsers,
    setStatus,
    setCurrentQuestion,
    setTimeLeft,
    setAnswerStatistics,
  ]);
};
