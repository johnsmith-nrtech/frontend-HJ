import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Sofa Deal",
  description: "Reset your Sofa Deal account password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
