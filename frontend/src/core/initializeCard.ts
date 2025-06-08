export const initializeCard = () => {
  const formData = new FormData();
  formData.append('rectoText', '');
  formData.append('versoText', '');
  return formData;
};
