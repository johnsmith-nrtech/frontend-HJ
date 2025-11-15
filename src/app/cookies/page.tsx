'use client';
import Head from "next/head";
import { useEffect } from "react";

const CookiePolicyPage = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <Head>
        <title>Cookie Policy | Sofa Deal</title>
        <meta
          name="description"
          content="Learn how Sofa Deal uses cookies and similar technologies to enhance your browsing experience."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-5xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Cookie Policy</h1>

        <div className="text-[17px] leading-relaxed text-gray-800">
          <a
            href="https://www.iubenda.com/privacy-policy/89971211/cookie-policy"
            className="iubenda-white no-brand iubenda-embed iub-body-embed"
            title="Cookie Policy"
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;