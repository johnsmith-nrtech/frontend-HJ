// pages/returns.tsx

import Head from "next/head";

const ReturnsPolicyPage = () => {
  return (
    <>
      <Head>
        <title>Returns & Refund Policy | Sofa Deal</title>
        <meta
          name="description"
          content="Review Sofa Deal’s return and refund policy, including how to initiate returns, refund timelines, and handling of custom items."
        />
      </Head>

      <div className="mx-auto mt-12 max-w-5xl px-4 py-10 md:px-10 lg:px-24">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Returns & Refund Policy
        </h1>
        <p className="mb-10 text-sm text-gray-600">
          Last updated: 15 August 2025
        </p>

        <div className="space-y-8 text-[17px] leading-relaxed text-gray-800">
          <section>
            <h2 className="mb-2 text-xl font-semibold">1. Overview</h2>
            <p>
              We hope you love your sofa, but if you’re not completely
              satisfied, our policy aims to make returns easy.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              2. Cooling-Off Period
            </h2>
            <p>
              You have 14 calendar days from delivery to notify us of
              cancellation (Consumer Contracts Regulations).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">3. How to Return</h2>
            <p>
              Email{" "}
              <a
                href="mailto:returns@sofadeal.co.uk"
                className="text-blue-600 underline"
              >
                returns@sofadeal.co.uk
              </a>{" "}
              with your order number. You’re responsible for return shipping
              unless the item is faulty.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">4. Item Conditions</h2>
            <p>
              Returns must be in original condition, unused, and with original
              packaging.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              5. Faulty or Damaged Items
            </h2>
            <p>
              For faulty or damaged goods, we’ll offer repair, replacement, or
              refund per Consumer Rights Act 2015.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">6. Refund Processing</h2>
            <p>
              Refunds are issued within 14 days of receipt of the returned item.
              We’ll refund using the original payment method.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              7. Custom or Bespoke Products
            </h2>
            <p>
              Custom-made items cannot be returned unless defective; this
              excludes your right to a remedy for faulty goods.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default ReturnsPolicyPage;
