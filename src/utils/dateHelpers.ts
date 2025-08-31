export const formatDateForBackend = (dateString: string): string => {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
};

export const formatDateFromBackend = (isoString: string): string => {
  // Para mostrar en inputs de tipo date (YYYY-MM-DD)
  return isoString.split('T')[0];
};