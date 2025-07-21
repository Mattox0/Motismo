import React, { useState } from 'react';

interface ICardFlipProps {
  frontContent: string;
  backContent: string;
  frontType: 'image' | 'text';
  backType: 'image' | 'text';
  flipped?: boolean;
  setFlipped?: (flipped: boolean) => void;
}

const CardFlip: React.FC<ICardFlipProps> = ({
  frontContent,
  backContent,
  frontType,
  backType,
  flipped,
  setFlipped,
}) => {
  const [localFlipped, setLocalFlipped] = useState(false);
  const isControlled = typeof flipped === 'boolean' && typeof setFlipped === 'function';
  const isFlipped = isControlled ? flipped : localFlipped;
  const handleFlip = () => {
    if (isControlled) setFlipped && setFlipped(!flipped);
    else setLocalFlipped(f => !f);
  };

  return (
    <div className="card-flip">
      <div
        className={`card-flip__inner${isFlipped ? ' card-flip__inner--flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="card-flip__face card-flip__face--front">
          {frontType === 'image' ? null : (
            <div className="card-flip__label card-flip__label--front">Terme :</div>
          )}
          <div className="card-flip__content card-flip__content--front">
            {frontType === 'image' ? (
              <img
                src={frontContent}
                alt="card front"
                className="card-flip__image"
                loading="lazy"
              />
            ) : (
              <span className="card-flip__text">{frontContent}</span>
            )}
          </div>
        </div>
        <div className="card-flip__face card-flip__face--back">
          {backType === 'image' ? null : (
            <div className="card-flip__label card-flip__label--back">Définition :</div>
          )}
          <div className="card-flip__content card-flip__content--back">
            {backType === 'image' ? (
              <img src={backContent} alt="card back" className="card-flip__image" loading="lazy" />
            ) : (
              <span className="card-flip__text">{backContent}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardFlip;
