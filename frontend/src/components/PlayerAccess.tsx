'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { ICreateGameUserRequest, useCreateGameUserMutation } from '@/services/game.service';
import { showToast } from '@/utils/toast';

import { Button } from './forms/Button';
import { ColorPicker } from './forms/ColorPicker';
import Input from './forms/Input';
import { SplashScreen } from './SplashScreen';

export const PlayerAccess: React.FC = () => {
  const params = useParams();
  const rawCode = params.code;
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const { data } = useSession();

  const [name, setName] = useState(data?.user.name);
  const [eyeIndex, setEyeIndex] = useState(0);
  const [mouthIndex, setMouthIndex] = useState(0);
  const [color, setColor] = useState('#808080');
  const [eyesOptions, setEyesOptions] = useState<string[]>([]);
  const [mouthOptions, setMouthOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [createGameUser] = useCreateGameUserMutation();

  const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/svg?eyes=${eyesOptions[eyeIndex]}&mouth=${mouthOptions[mouthIndex]}&backgroundType=solid&backgroundColor=${color.slice(1)}`;

  const cycleIndex = (dir: 'prev' | 'next', length: number, idx: number) =>
    dir === 'prev' ? (idx - 1 + length) % length : (idx + 1) % length;

  useEffect(() => {
    fetch('https://api.dicebear.com/9.x/fun-emoji/schema.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(schema => {
        setEyesOptions(schema.properties.eyes.items.enum);
        setMouthOptions(schema.properties.mouth.items.enum);
      })
      .catch(err => {
        console.error(err);
        showToast.error('Impossible de charger les options d’avatar');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    if (!name || !name.trim()) {
      showToast.error('Veuillez entrer un pseudo.');
      return;
    }
    const player: ICreateGameUserRequest = {
      name: name.trim(),
      avatar: avatarUrl,
      externalId: data?.user.id,
    };
    createGameUser({ code, data: player })
      .unwrap()
      .then(gameUser => {
        localStorage.setItem(code, JSON.stringify(gameUser));
        window.location.reload();
      })
      .catch(err => {
        console.error(err);
        showToast.error('Impossible de rejoindre la partie');
      });
  };

  if (!code) return null;

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <div className="mb-6">
          <label className="block font-medium mb-1">Pseudo</label>
          <Input
            type="text"
            value={name ?? ''}
            onChange={e => setName(e.target.value)}
            placeholder="Votre pseudo"
            className="w-full border rounded px-3 py-2"
            maxLength={20}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-center">Choisissez votre avatar</label>
          <div className="relative flex justify-center items-center">
            <div className="flex flex-col items-center absolute left-0">
              <button
                type="button"
                onClick={() => setEyeIndex(cycleIndex('prev', eyesOptions.length, eyeIndex))}
                className="px-2 py-1 mb-2 bg-gray-200 rounded"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => setMouthIndex(cycleIndex('prev', mouthOptions.length, mouthIndex))}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                &lt;
              </button>
            </div>

            <img src={avatarUrl} alt="Avatar preview" className="w-32 h-32 mx-4 rounded-lg" />

            <div className="flex flex-col items-center absolute right-0">
              <button
                type="button"
                onClick={() => setEyeIndex(cycleIndex('next', eyesOptions.length, eyeIndex))}
                className="px-2 py-1 mb-2 bg-gray-200 rounded text-2xl"
              >
                &gt;
              </button>
              <button
                type="button"
                onClick={() => setMouthIndex(cycleIndex('next', mouthOptions.length, mouthIndex))}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        <ColorPicker color={color} setColor={setColor} />

        <Button variant="primary" type="submit" className="mt-4">
          Rejoindre
        </Button>
      </form>
    </div>
  );
};
