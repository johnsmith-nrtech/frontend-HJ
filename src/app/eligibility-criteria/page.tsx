"use client";

import Image from "next/image";
import { Button } from "@/components/button-custom";
import { useRouter } from "next/navigation";

export default function EligibilityCriteria() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">
        Check Your Eligibility for 0% Finance
      </h1>

      <div className="prose prose-lg space-y-6 text-gray-700">
        <p>
          At Sofa Deal by Aleena London Ltd, we offer flexible finance options to help you spread the cost of your purchase with affordable monthly payments. Through our finance partner, <strong>Ideal4Finance</strong>.
        </p>

        <p>
          Eligible customers can apply for 0% finance for up to 36 months, subject to status and approval.
        </p>

        <p>
          Customers can choose a deposit starting from a minimum of 10% up to 50% of the total order value. The remaining balance can then be spread across available repayment terms including 6, 12, 24, and 36 months. Longer finance terms may also be available; however, these may include applicable finance charges and may not qualify for 0% APR.
        </p>

        <h2 className="text-xl font-bold mt-8">Eligibility Criteria</h2>
        <p>To apply for finance, applicants will generally need to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be at least 18 years old</li>
          <li>Be a UK resident with at least 3 years of UK address history</li>
          <li>Be employed, self-employed, or retired</li>
          <li>Have a valid UK bank account and debit card in their own name</li>
          <li>Provide valid UK identification where required</li>
          <li>Meet lender affordability and credit assessment criteria</li>
        </ul>

        <p>
          All finance applications are subject to status, affordability checks, and approval by the lender panel used by Ideal4Finance. Approval is not guaranteed and the rate offered may depend on individual circumstances, loan amount, and repayment term.
        </p>

        <h2 className="text-xl font-bold mt-8">Important Information</h2>
        <p>
          Aleena London Ltd acts as an Introducer Appointed Representative of Ideal Sales Solutions Ltd trading as Ideal4Finance. Ideal Sales Solutions Ltd is a credit broker and not a lender (FRN 703401). Finance options are arranged through a panel of lenders regulated in the UK.
        </p>
        <p>
          Sofa Deal by Aleena London Ltd does not provide financial advice. Customers must complete finance applications themselves through the official application system provided by Ideal4Finance.
        </p>

        <h2 className="text-xl font-bold mt-8">Apply for Finance</h2>
        <p>
          To check your eligibility and apply online, please use the secure application link below:
        </p>
        <a
          href="https://ideal4finance.com/loan-apply/aleena?r=ob"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          https://ideal4finance.com/loan-apply/aleena?r=ob
        </a>
        <p>
          Please ensure that the purchase amount, selected deposit percentage, and repayment term entered in your finance application match the options selected during checkout on our website.
        </p>

        {/* Video */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
            <video src="/payment.mp4" controls className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Back to Shop Button */}
      <Button
        variant="main"
        size="xl"
        rounded="full"
        className="bg-blue fixed bottom-6 left-6 z-50 items-center justify-start"
        icon={
          <Image
            src="/arrow-right.png"
            alt="arrow-right"
            width={20}
            height={20}
            className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
          />
        }
        onClick={() => router.push("/products")}
      >
        Shop Now
      </Button>
    </main>
  );
}