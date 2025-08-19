import { FC, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { IClasse } from '@/types/model/IClasse';

interface IClassSelectorProps {
  classes: IClasse[];
  selectedClassIds: string[];
  onSelectionChange: (classIds: string[]) => void;
  error?: string;
}

export const ClassSelector: FC<IClassSelectorProps> = ({
  classes,
  selectedClassIds,
  onSelectionChange,
  error,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClassToggle = (classId: string) => {
    const newSelection = selectedClassIds.includes(classId)
      ? selectedClassIds.filter(id => id !== classId)
      : [...selectedClassIds, classId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allClassIds = classes.map(classe => classe.id);
    onSelectionChange(allClassIds);
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const selectedClasses = classes.filter(classe => selectedClassIds.includes(classe.id));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="class-selector" ref={dropdownRef}>
      <label className="form-label">{t('create_quiz.form.classes')}</label>

      <div className="class-selector__container">
        <div
          className={`class-selector__trigger ${error ? 'class-selector__trigger--error' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="class-selector__selected">
            {selectedClasses.length === 0 ? (
              <span className="class-selector__placeholder">
                {t('create_quiz.form.classes_placeholder')}
              </span>
            ) : (
              <div className="class-selector__selected-items">
                {selectedClasses.slice(0, 2).map(classe => (
                  <span key={classe.id} className="class-selector__selected-item">
                    {classe.name}
                  </span>
                ))}
                {selectedClasses.length > 2 && (
                  <span className="class-selector__selected-more">
                    +{selectedClasses.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          <svg
            className={`class-selector__arrow ${isOpen ? 'class-selector__arrow--open' : ''}`}
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="class-selector__dropdown">
            <div className="class-selector__actions">
              <button type="button" className="class-selector__action" onClick={handleSelectAll}>
                {t('create_quiz.form.select_all')}
              </button>
              <button type="button" className="class-selector__action" onClick={handleSelectNone}>
                {t('create_quiz.form.select_none')}
              </button>
            </div>

            <div className="class-selector__options">
              {classes.length === 0 ? (
                <div className="class-selector__empty">{t('create_quiz.form.no_classes')}</div>
              ) : (
                classes.map(classe => (
                  <label key={classe.id} className="class-selector__option">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(classe.id)}
                      onChange={() => handleClassToggle(classe.id)}
                      className="class-selector__checkbox"
                    />
                    <span className="class-selector__option-text">{classe.name}</span>
                    <span className="class-selector__option-code">{classe.code}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="form-error">{t(error)}</span>}

      {selectedClassIds.length > 0 && (
        <div className="class-selector__summary">
          {t('create_quiz.form.selected_classes', { count: selectedClassIds.length })}
        </div>
      )}
    </div>
  );
};
