"use client";

import { Button } from "@/components/button-custom";
import Head from "next/head";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function KlarnaTerms() {
  return (
    <>
      <Head>
        <title>Klarna Pay in 3 Terms & Conditions</title>
        <meta
          name="description"
          content="Full terms and conditions for Klarna Pay in 3 instalments service."
        />
      </Head>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">
          Pay in 3 Instalments Terms and Conditions
        </h1>

        <div className="prose prose-lg space-y-6">
          <p>Thank you for choosing to shop with Klarna.</p>

          <p>
            This is a credit agreement between you and us. When we use ‘us’,
            ‘we’ or ‘our’ in this document, we mean Klarna Financial Services UK
            Limited. When we use ‘you’ in this document, we mean anyone who has
            bought something using Pay in 3 instalments with Klarna.
          </p>

          <h2>1. Who can use Pay in 3?</h2>
          <p>
            You must be a UK resident, over 18 years old and have a valid
            payment card to use Pay in 3. When we say ‘valid payment card’, we
            mean the card must be in your name, and must not have expired. You
            should also make sure the card you use has enough money available to
            cover all the instalments.
          </p>
          <p>
            Pay in 3 is a credit product. It’s our decision whether or not we
            start a credit agreement with you.
          </p>

          <h2>2. How do I Pay in 3 instalments?</h2>
          <p>
            With Pay in 3, you can pay for something you buy by dividing the
            cost into three equal instalments. At checkout, you’ll see an option
            to ‘Pay in 3 interest-free instalments’. When you choose this
            option, just enter your card details to complete your purchase.
          </p>
          <p>
            There won’t be any interest, fees or charges for using a debit or
            credit card by Klarna. Although your bank might charge you interest
            or other fees on top if you pay using an interest-bearing credit
            card, for example.
          </p>

          <h2>
            3. Are there any alternative options for paying off my balance?
          </h2>
          <p>
            Yes, you are able to make payment early through the Klarna App by
            paying by card immediately or you can request our bank account
            details from Klarna’s Customer Services team for direct bank
            transfer. If a payment is made earlier, and the balance cleared we
            will not continue charging your card.
          </p>

          <h2>4. Which cards does Klarna accept?</h2>
          <p>
            Klarna accepts most cards except prepaid cards. We may also not
            accept a card that’s due to expire in the near future. We’ll let you
            know at checkout if your card hasn’t been accepted.
          </p>

          <h2>5. What if something goes wrong?</h2>
          <p>
            Klarna offers consumers Buyer Protection which means for example
            that you as a consumer do not have to pay for the ordered goods
            until you have received them, and that Klarna will assist you with
            problems related to your purchase.
          </p>
          <p>
            For more information and instructions please go to:{" "}
            <a
              href="https://www.klarna.com/uk/buyer-protection-description/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.klarna.com/uk/buyer-protection-description/
            </a>
          </p>

          <h2>6. When will Klarna take my payments?</h2>
          <p>
            At the point of purchase we’ll freeze the first of your three
            instalments on your card. This means you won’t be able to spend this
            money on anything else. Once we&rsquo;ve received confirmation that
            your items have been shipped, or that the order has been processed,
            the first of your three payments will be taken from your card
            automatically using the frozen amount. You’ll be able to see this on
            your card statement. If your items are not shipped, we’ll unfreeze
            or refund your money and you’ll be able to spend it again. This may
            take a few days depending on which bank you’re with.
          </p>
          <p>
            The second payment will be taken 30 days after the first payment,
            and the last one 60 days after the first payment. We’ll charge your
            card automatically when your payment is due so you don’t have to pay
            us back manually or worry about missing a payment.
          </p>
          <p>
            The dates these payments are due will be sent to you by email, and
            you’ll be able to check them in our app.
          </p>
          <p>
            Sometimes the shop (instore or online merchant) doesn’t charge you
            for your whole order all at once. They might do this if they ship
            your items at different times. If this happens, we’ll make a new Pay
            in 3 plan for each part order they make. Each of these order parts
            will have its own due date, depending on when the shop confirms that
            part of your order.
          </p>
          <p>
            You can cancel recurring card payments at any time by contacting us,
            and/or your card provider but please remember to keep up with any
            instalments due. If you want to make recurring card payments from
            another card, you can do this via the Klarna app.
          </p>

          <h2>7. Currency conversion</h2>
          <p>
            When Klarna initiates a currency conversion, we&rsquo;ll complete it
            at the rate in effect when your items are shipped or services
            activated. While we&rsquo;ll show you the expected conversion rate
            at purchase, it may change if rates fluctuate between your purchase
            and shipping/activation dates. Our conversion rate includes our
            exchange rate mark-up, plus the base rate from wholesale currency
            markets on the conversion day or previous business day. When
            required by law or regulation, we&rsquo;ll use the applicable
            government reference rate.
          </p>
          <p>
            Currency conversion rate changes could work for or against you in
            cases of returns or refunds. If you request a partial or full refund
            after making a return, you will be responsible for any fluctuations
            in the currency conversion rate.
          </p>

          <h2>
            8. What happens if my card is cancelled, or my card details change?
          </h2>
          <p>
            If your card is cancelled, you’ll still have to pay us any money you
            owe as soon as we ask you to.
          </p>
          <p>
            If your card details change between your purchase and your final
            payment, you must tell us your new details. You can do this online.
            If you don’t give us this information, we might ask the bank for
            your details.
          </p>

          <h2>9. What happens if I cancel my order?</h2>
          <p>
            Your cancellation is subject to the store’s cancellation policy, so
            you need to check the store’s website for information on their
            cancellation policy and instructions on how to cancel an order and
            return the good(s) if already received.
          </p>
          <p>
            If your next payment or due date for the cancelled order is
            approaching, you can pause billing by choosing that order in the
            Klarna App and click “Report a problem”.
          </p>
          <p>
            Once the store has confirmed the cancellation or return, Klarna will
            update your payments accordingly as well as refund any amounts due.
            Refund processing times to you may vary and can take up to 14 days
            depending on the consumer’s bank.
          </p>
          <p>
            If you cancel your order, we’ll cancel any outstanding payments and
            pay back any amounts we’ve already taken from your card. We’ll do
            our best to pay you back as soon as we can.
          </p>
          <p>
            If you want to return part of your order, we’ll take the amount from
            your outstanding balance. It won’t count as a payment, so you’ll
            need to continue making your payments on the dates they’re due until
            your balance is paid in full.
          </p>
          <h2>10. How and when will I receive my refund?</h2>
          <p>
            Refunds for Pay in 3 are processed in different ways. It depends on
            the status of your payment schedule, how much you’ve paid and if the
            merchant has processed a full or partial refund.
          </p>
          <p>
            <strong>Full refund</strong>
          </p>
          <p>
            If you’re due a full refund, we’ll cancel any remaining payments and
            refund anything you’ve already paid to the card you used to make the
            payment.
          </p>
          <p>
            <strong>Partial refund</strong>
          </p>
          <p>
            If you’re due a partial refund that’s more than the remaining
            balance on your order, we’ll deduct the amount from the outstanding
            balance first. We&rsquo;ll then refund the difference to the card
            you used to pay off the purchase.
          </p>
          <p>
            If the partial refund is less than the remaining balance on your
            order, we’ll deduct the amount from the outstanding balance. We’ll
            then spread the remaining balance evenly over the remaining
            payments.
          </p>

          <h2>
            11. What happens if you can’t take an instalment because I don’t
            have enough money on my card?
          </h2>
          <p>
            If we can’t take the first instalment from your card, we’ll let you
            know, and try up to two times again to take the money. We’ll let you
            know when we’re going to try again, so you’ll have plenty of time to
            put some money onto your card to make the payment.
          </p>
          <p>
            If we can’t take the money from you after two attempts, we’ll roll
            the missed payment over to the second instalment. If we can’t take
            the second instalment, we’ll give you a few days to update your card
            details or make sure there’s enough money on your card.
          </p>
          <p>
            If we still can’t take payment after two more attempts, we’ll roll
            over the payment to the next and final instalment. If we still can’t
            take the payment, we’ll try again twice. If we’re still not
            successful, we might ask you to pay the outstanding amount directly
            or use a debt collection agency to collect the money for us. A debt
            collection agency is an FCA regulated company used by Klarna to
            recover funds that are overdue.
          </p>
          <p>
            Klarna will always get in touch with you before charging your card.
            We will also contact you if we roll over a payment to the next due
            date or if we have to use a debt collection agency.
          </p>
          <p>
            Not paying your instalments on time might also mean you can’t use
            Klarna in the future. We will report information to credit reference
            agencies about the payments you make, and about any payments that
            you fail to make on time. Borrowing more than you can afford or
            paying late may negatively impact your financial status and ability
            to obtain credit from Klarna and other lenders in the future.
          </p>

          <h2>12. Will using Pay in 3 affect my credit score?</h2>
          <p>
            We might carry out a limited credit search on you at a credit
            reference agency. This is a ‘soft credit check’, and won’t affect
            your credit score, but we will report information to credit
            reference agencies about the payments you make, and about any
            payments that you fail to make on time. Failure to pay on time might
            affect your ability to obtain credit in the future from Klarna and
            other lenders. More information about reporting to credit reference
            agencies can be found in Klarnas Privacy Notice.
          </p>

          <h2>13. Do you charge late fees?</h2>
          <p>
            We will charge you a late fee if you do not pay us up to 14 days
            after your 2nd or 3rd instalments are due. We’ll attempt up to three
            times to charge your card within this time. If we are still not able
            to collect payment from you, we will charge you a late fee. You will
            not be charged a late fee if we collect payment or you pay us before
            then.
          </p>
          <p>
            We’ll send you plenty of friendly reminders so you can make sure
            you’ve got enough money on your card before we collect payment from
            you.
          </p>
          <p>
            If your order is £20 or more, we will charge you a late fee of £5.
            If you only receive part of your order and the total value is £20 or
            less, the late fee will only be 25% of the purchase price of the
            order. For example, if your order’s total value is £16, you will be
            charged a £4 late fee, which is 25% of £16.
          </p>
          <p>
            You will only be charged a maximum of one late fee per instalment.
            We won’t charge you a late fee if you have less than £1 left to pay.
          </p>
          <p>
            We may delay or decide not to charge you late fees. If we do not
            enforce our rights against you for late fees, this will not stop us
            enforcing those rights at a later date. If you think late fees have
            been charged in error, please contact Klarna Customer Services.
          </p>

          <h2>
            14. How does Klarna store my card details and my personal data?
          </h2>
          <p>
            We store your card details on our systems when you shop with us.
            We’ll use these details to approve future payments. Unless you opt
            out, we may also use this information to fill out your card details
            for your convenience when you buy things in the future.
          </p>
          <p>
            You can manage your cards online. If Klarna gets updated card
            details from your bank, we might also store this information on our
            system.
          </p>
          <p>
            We use your personal data to identify you and to carry out customer
            analysis, credit assessments, credit reporting to credit reference
            agencies, marketing and business development. We might also share
            your data with some partners (such as credit reference bureaus),
            which might be based outside of the UK.
          </p>
          <p>
            Please see our Privacy Notice here for more information about your
            rights, how you can get in touch with us, or to complain. By using
            Klarna’s services you confirm that you’ve read this notice.
          </p>

          <h2>15. How do I make a complaint?</h2>
          <p>
            You can make a complaint through our customer service webpage using
            our live chat feature, or by calling us on (+44) 0808 189 3333. We
            try to handle all complaints as quickly and smoothly as possible.
            You cannot make a complaint to the Financial Ombudsman Service about
            Pay in 3.
          </p>
          <p>
            If you’re not happy with our response, you can contact Klarna’s
            Complaints Adjudicator. Use the form provided alongside your final
            response.
          </p>
          <p>You can find our full complaints information here.</p>

          <h2>16. Transfer of rights</h2>
          <p>
            This is a credit agreement between you and us. You can’t transfer
            your rights or obligations to anyone else unless you get our
            permission first.
          </p>
          <p>
            We can transfer these terms, or any rights and obligations you have
            under them, at any time. We don’t need to ask for your consent to do
            this, unless transferring would harm your rights and
            responsibilities. This means we have the right to transfer the
            credit agreement to another provider without asking you.
          </p>

          <h2>17. Klarna</h2>
          <p>
            Klarna Financial Services UK Limited (“Klarna”) is authorised and
            regulated by the Financial Conduct Authority (“FCA”) for carrying
            out regulated consumer credit activities (firm reference number
            987889), and for the provision of payment services under the Payment
            Services Regulations 2017 (firm reference number 987816). Klarna
            provides both regulated and unregulated products. Klarna’s Pay in 3
            instalments and Pay in 30 days agreements are not regulated by the
            FCA. Incorporated in England (company number 14290857), with its
            registered office at 10 York Road, London, England, SE1 7ND.
          </p>
          <p>
            For further information about Klarna, go to:{" "}
            <a href="https://www.klarna.com/uk/">https://www.klarna.com/uk/</a>
          </p>

          <h2>18. Governing law</h2>
          <p>
            This Agreement is governed by the laws of England and is subject to
            the non-exclusive jurisdiction of the courts of England and Wales.
            If you are a resident of Northern Ireland you may also bring
            proceedings in Northern Ireland, and if you are a resident of
            Scotland, you may also bring proceedings in Scotland.
          </p>

          {/* Continue like this for sections 8 through 18 */}
          {/* I’ll include them in full if you want me to paste the rest as well. */}
        </div>

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
          onClick={() => redirect("/products")}
        >
          Shop Now
        </Button>
      </main>
    </>
  );
}
