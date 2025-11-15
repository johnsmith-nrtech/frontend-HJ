// pages/user-data-protection.tsx

import Head from "next/head";

const UserDataProtectionPage = () => {
  return (
    <>
      <Head>
        <title>User Data Protection | Sofa Deal</title>
        <meta
          name="description"
          content="Learn about Sofa Deal's compliance with UK GDPR and Data Protection Act 2018, including roles, data breach protocols, and privacy practices."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-4xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          User Data Protection
        </h1>
        <p className="mb-10 text-sm text-gray-600">
          Last updated: 15 August 2025
        </p>

        <ol className="list-inside list-decimal space-y-4 text-lg leading-relaxed text-gray-800">
          <li>
            <strong>Data Protection Framework</strong>
            <br />
            We comply fully with the UK GDPR and Data Protection Act 2018.
          </li>
          <li>
            <strong>Core Principles We Follow:</strong> Lawfulness, fairness,
            transparency; purpose limitation; data minimisation; accuracy;
            storage limitation; integrity and confidentiality; and
            accountability.
          </li>
          <li>
            <strong>Roles & Accountability</strong>
            <br />
            We act as the Data Controller. If required, a Data Protection
            Officer (DPO) will be appointed and contact details provided.
          </li>
          <li>
            <strong>Data Breach Protocol</strong>
            <br />
            In case of a personal data breach, we will notify the ICO and
            affected users within 72 hours, where required.
          </li>
          <li>
            <strong>Impact Assessments</strong>
            <br />
            For high-risk data processing (e.g., profiling), we conduct Data
            Protection Impact Assessments (DPIAs).
          </li>
          <li>
            <strong>Privacy by Design</strong>
            <br />
            Data privacy is integrated into our products and operations from the
            outset.
          </li>
        </ol>
      </div>
    </>
  );
};

export default UserDataProtectionPage;
