import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Sofa Deal",
  description: "Reset your Sofa Deal account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
