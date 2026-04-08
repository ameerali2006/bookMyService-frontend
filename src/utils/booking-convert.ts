export const generateBookingCode = (id: string): string => {
  return `BK-${id.substring(18, 24).toUpperCase()}`;
};