const faqs = [
  {
    question: "What comes in the set?",
    answer:
      "You receive one 8-inch chef's knife for larger prep work and one 4-inch paring knife for peeling, trimming, and precision tasks.",
  },
  {
    question: "Is this an original ZWILLING product?",
    answer:
      "The set is presented as genuine ZWILLING German-engineered cutlery. If you would like to verify packaging or product markings before accepting delivery, contact ChefKeshav support at 9842839204.",
  },
  {
    question: "How much is delivery?",
    answer:
      "Delivery is Rs 100 inside Kathmandu Valley and Rs 150 outside Kathmandu Valley. The correct fee is added automatically at checkout.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders are typically delivered within 2–5 business days. A sales representative will call you to confirm your order and delivery details.",
  },
  {
    question: "How should I care for the knives?",
    answer:
      "Hand wash with mild soap, dry immediately, and store in a knife block, sheath, or magnetic strip. Avoid glass cutting boards and dishwashers to preserve the edge and handle.",
  },
  {
    question: "What payment method is available?",
    answer:
      "This order funnel currently supports Cash on Delivery. No online payment is collected on this website.",
  },
  {
    question: "Can I order more than one set?",
    answer:
      "Yes. Select your quantity on the product section or checkout page. The product total and delivery charge update automatically.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-paper py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p className="eyebrow text-zwilling">Good to know</p>
          <h2 className="display mt-4 text-4xl font-bold sm:text-5xl">Questions, answered.</h2>
          <p className="mt-5 max-w-sm leading-7 text-black/60">
            Need more help? Call <a className="font-bold text-ink underline" href="tel:+9779842839204">9842839204</a>.
          </p>
        </div>
        <div className="divide-y divide-black/10 border-y border-black/10">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group py-1" open={index === 0}>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-extrabold marker:hidden">
                {faq.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bone transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 leading-7 text-black/60">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
