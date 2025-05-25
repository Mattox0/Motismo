export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Date non disponible';

  // Convertir en objet Date si ce n'est pas déjà le cas
  const dateObj = date instanceof Date ? date : new Date(date);

  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};
