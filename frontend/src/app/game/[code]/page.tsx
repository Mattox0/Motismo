'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { PlayerAccess } from '@/components/PlayerAccess';
import { SplashScreen } from '@/components/SplashScreen';
import { GamePage } from '@/containers/GamePage';
import { GameProvider } from '@/providers/GameProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { useGetQuizByCodeQuery } from '@/services/quiz.service';

export interface IPlayerData {
  id?: string;
  avatar?: string;
  name?: string;
  externalId?: string;
}

export default function GamePageWrapper() {
  const params = useParams();
  const rawCode = params.code;
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const router = useRouter();
  const { data: session } = useSession();
  const { data: quizz } = useGetQuizByCodeQuery(code ?? '', {
    skip: !code,
  });
  const [player, setPlayer] = useState<IPlayerData | null>(null);

  useEffect(() => {
    if (!code || !quizz) return;
    try {
      const stored = localStorage.getItem(code as string);
      if (stored) {
        const parsed: IPlayerData = JSON.parse(stored);
        if (quizz.author.id === session?.user.id) {
          setPlayer({
            id: parsed.id,
            avatar: parsed.avatar,
            name: session.user.name ?? '',
            externalId: session.user.id,
          });
        } else if (parsed.id) {
          setPlayer(parsed);
        }
      } else if (quizz.author.id === session?.user.id) {
        setPlayer({
          name: session.user.name ?? '',
          externalId: session.user.id,
        });
      }
    } catch {
      localStorage.removeItem(code as string);
    }
  }, [code, quizz, session]);

  if (!code) return router.push('/');

  if (!quizz) {
    return <SplashScreen />;
  }

  if (!player) {
    return <PlayerAccess />;
  }

  return (
    <SocketProvider player={player}>
      <GameProvider>
        <GamePage code={code} quizz={quizz} />
      </GameProvider>
    </SocketProvider>
  );
}
