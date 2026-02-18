import { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Sofa Deal",
  description: "Login to your Sofa Deal account",
};

export default function LoginPage() {
  return <LoginForm />;
}
