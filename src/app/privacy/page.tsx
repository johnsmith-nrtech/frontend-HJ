'use client';
import Head from "next/head";
import { useEffect } from "react";

const PrivacyPolicyPage = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <Head>
        <title>Privacy Policy | Sofa Deal</title>
        <meta
          name="description"
          content="Read Sofa Deal's Privacy Policy to understand how we collect, use, and protect your personal data."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-5xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Privacy Policy</h1>

        <div className="text-[17px] leading-relaxed text-gray-800">
          <a
            href="https://www.iubenda.com/privacy-policy/89971211"
            className="iubenda-white no-brand iubenda-embed iub-body-embed"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;