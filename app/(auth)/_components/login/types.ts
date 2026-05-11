export type AuthStep = "credentials" | "needs_email_code" | "needs_2fa";
export type SecondFactorMethod = "totp" | "phone_code" | "backup_code" | "email_code";
export type TwoFactorStep = "select_method" | "verify_code";

export interface SharedErrorProps {
  error: string | null;
}

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
}
