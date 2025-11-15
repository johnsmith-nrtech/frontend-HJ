import { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | Sofa Deal",
  description: "Register for a Sofa Deal account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
