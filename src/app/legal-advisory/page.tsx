// pages/legal-advisory.tsx

import Head from "next/head";

const LegalAdvisoryPage = () => {
  return (
    <>
      <Head>
        <title>Legal Advisory | Sofa Deal</title>
        <meta
          name="description"
          content="General legal information from Sofa Deal. This content does not constitute legal advice. For specific advice, consult a qualified solicitor."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-4xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Legal Advisory
        </h1>
        <p className="mb-10 text-sm text-gray-600">
          Last updated: 15 August 2025
        </p>

        <p className="text-lg leading-relaxed text-gray-800">
          The content on Sofa Deal is for general information only and does not
          constitute legal advice. Although we endeavour to update this
          information, its accuracy cannot be guaranteed. For legal certainty,
          especially regarding areas like consumer law, data protection, or
          returns, we recommend consulting a qualified solicitor.
        </p>
      </div>
    </>
  );
};

export default LegalAdvisoryPage;
