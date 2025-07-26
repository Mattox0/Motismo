'use client';

import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { showToast } from '@/utils/toast';

import Input from './Input';

interface IColorPickerProps {
  setColor: (code: string) => void;
  color: string;
}

const palette = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673AB7',
  '#3f51b5',
  '#2196f3',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8BC34A',
  '#cddc39',
  '#ffeb3b',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];

export const ColorPicker: FC<IColorPickerProps> = ({ setColor, color }) => {
  const [hexInput, setHexInput] = useState(palette[0]);
  const { t } = useTranslation();
  const [mode, setMode] = useState<'palette' | 'custom'>('palette');

  const applyHex = () => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setColor(hex);
    } else {
      showToast.error(t('error.hex_invalid'));
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyHex();
    }
  };

  return (
    <div>
      <div className="flex mb-2 justify-center">
        <button
          type="button"
          className={`px-4 py-1 ${mode === 'palette' ? 'font-bold border-b-2' : ''}`}
          onClick={() => setMode('palette')}
        >
          Palette
        </button>
        <button
          type="button"
          className={`px-4 py-1 ${mode === 'custom' ? 'font-bold border-b-2' : ''}`}
          onClick={() => setMode('custom')}
        >
          Personnalisée
        </button>
      </div>

      {mode === 'palette' && (
        <div className="flex justify-center flex-wrap gap-2">
          {palette.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setColor(c);
                setHexInput(c);
              }}
              className={`w-8 h-8 rounded-full border-2 ${c === color ? 'border-black' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div className="flex items-center justify-center gap-2">
          <Input
            type="text"
            value={hexInput}
            onChange={e => setHexInput(e.target.value)}
            onBlur={applyHex}
            onKeyDown={handleKey}
            placeholder="#RRGGBB"
            pattern="^#([A-Fa-f0-9]{6})$"
            className="border rounded px-2 py-1 w-28"
          />
        </div>
      )}
    </div>
  );
};
