const ADMIN_PASSWORD_KEY = 'aps_admin_password';
export const DEFAULT_ADMIN_PASSWORD = '1234';

export function getAdminPassword(): string {
  try {
    const saved = localStorage.getItem(ADMIN_PASSWORD_KEY);
    return saved && saved.trim() ? saved : DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): boolean {
  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(passwordToVerify: string): boolean {
  return passwordToVerify.trim() === getAdminPassword();
}
