'use client';
import Head from "next/head";
import { useEffect } from "react";

const TermsAndConditionsPage = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <Head>
        <title>Terms and Conditions | Sofa Deal</title>
        <meta
          name="description"
          content="Review the Terms and Conditions of Sofa Deal to understand our services, responsibilities, and your rights."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-5xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Terms and Conditions</h1>

        <div className="text-[17px] leading-relaxed text-gray-800">
          <a
            href="https://www.iubenda.com/terms-and-conditions/89971211"
            className="iubenda-white no-brand iubenda-embed iub-body-embed"
            title="Terms and Conditions"
          >
            Terms and Conditions
          </a>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditionsPage;