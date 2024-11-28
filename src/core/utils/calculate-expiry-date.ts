export function calculateExpiryDate(expiredInMiliSeconds: number): Date {
  const now = new Date();
  // Thêm số giây vào thời gian hiện tại để tính thời điểm hết hạn.
  const expiryDate = new Date(now.getTime() + expiredInMiliSeconds);
  return expiryDate;
}
