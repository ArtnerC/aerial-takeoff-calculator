import Link from "next/link";

const benefits = [
  {
    number: "01",
    title: "Turn guesswork into a confident quote",
    text: "Customers see the area, depth, cubic yards, tons, and the math behind the number. That means fewer vague phone calls and fewer orders built on a hopeful guess.",
    accent: "bg-green-700",
  },
  {
    number: "02",
    title: "Capture projects after hours",
    text: "Homeowners plan weekend work when the yard is closed. The calculator gives them a useful next step right away, then hands a qualified order back to your team.",
    accent: "bg-amber-500",
  },
  {
    number: "03",
    title: "Protect delivery margins",
    text: "Quantity estimates account for depth, waste, density, weight limits, and delivery zones. Better estimates mean fewer second trips, refunds, and avoidable conversations.",
    accent: "bg-slate-900",
  },
];

const audiences = [
  ["Homeowners", "A simple path from a yard project to a cart-ready quantity."],
  ["Contractors", "A faster takeoff they can use from the job site or office."],
  ["Property managers", "Repeatable estimates for maintenance budgets and common areas."],
];

const differentiators = [
  [
    "Local material intelligence",
    "Not generic square-foot math. Product recommendations, densities, depths, and sellable quantities are built around the way Ground Control actually sells material.",
  ],
  [
    "Fulfillment-aware from the start",
    "Delivery zones, minimums, truck limits, weight, and blower placement become part of the estimate before an order reaches the yard.",
  ],
  [
    "Implemented with your team",
    "We map the catalog, pricing rules, delivery geography, and staff habits into the workflow, then keep a human in the loop when a job needs judgment.",
  ],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f5ef] text-slate-900">
      <header className="border-b border-slate-900/10 bg-[#f7f5ef]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Ground Control calculator home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white transition group-hover:rotate-6">
              GC
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-800">
              Ground Control
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4 text-sm font-medium">
            <Link href="/about" className="text-green-800 underline underline-offset-4">
              Why it matters
            </Link>
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-green-800"
            >
              Try calculator
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative border-b border-slate-900/10">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
            <div className="relative z-10">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-green-800">
                A better first conversation
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-7xl">
                Make the right amount the easiest thing to order.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-700">
                The Aerial Takeoff Calculator helps Ground Control turn a customer&apos;s
                project into a clear material estimate before uncertainty becomes a
                lost sale, a second delivery, or a long phone call.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/"
                  className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-800"
                >
                  Try the live calculator
                </Link>
                <a
                  href="tel:15417762275"
                  className="text-sm font-semibold text-slate-800 underline decoration-amber-500 decoration-2 underline-offset-4"
                >
                  Talk to Ground Control
                </a>
              </div>
            </div>

            <div className="relative min-h-[300px] rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 sm:min-h-[360px] sm:p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[18px] border-amber-400/90 sm:h-40 sm:w-40" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>From project to load</span>
                  <span className="text-amber-400">01—05</span>
                </div>
                <div className="my-10">
                  <p className="text-sm text-slate-400">A 500 sq ft bed at 3 inches</p>
                  <p className="mt-2 text-6xl font-black tracking-[-0.06em] text-white sm:text-7xl">
                    5 <span className="text-2xl font-bold tracking-normal text-amber-400">yd³</span>
                  </p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                    A quantity your customer can understand, your yard can prepare,
                    and your delivery team can act on.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Area × depth × material density
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-20 -left-16 hidden h-48 w-48 rounded-full border-[26px] border-green-700/15 lg:block" />
        </section>

        <section className="border-y border-slate-900/10 bg-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
                Why this is different
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                The math is simple. The local knowledge is the product.
              </h2>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
              {differentiators.map(([title, text], index) => (
                <article key={title} className="bg-slate-950 p-6 sm:p-7">
                  <p className="text-xs font-bold text-green-300">0{index + 1}</p>
                  <h3 className="mt-8 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.55fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-800">
                The business case
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                Less friction at every handoff.
              </h2>
            </div>
            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <article
                  key={benefit.number}
                  className="group grid gap-4 rounded-2xl border border-slate-900/10 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:bg-white sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-6"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white ${benefit.accent}`}>
                    {benefit.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{benefit.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{benefit.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-900/10 bg-[#e7eadf]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-800">
                  Built around your customers
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  One tool, three useful starting points.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-slate-600">
                Whether someone is refreshing a garden bed or planning a commercial
                delivery, the next step stays simple.
              </p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900/10 md:grid-cols-3">
              {audiences.map(([title, text]) => (
                <div key={title} className="bg-[#f7f5ef] p-6 sm:p-7">
                  <p className="text-sm font-bold text-green-800">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="rounded-[2rem] bg-green-800 px-6 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-200">
                See the workflow
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Give your next customer a clearer way to say, &ldquo;I need this much.&rdquo;
              </h2>
            </div>
            <Link
              href="/"
              className="mt-7 inline-flex shrink-0 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 lg:mt-0"
            >
              Open the calculator
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/10 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <span>Ground Control · Southern Oregon landscape supplies</span>
          <span>Estimate smarter. Deliver with confidence.</span>
        </div>
      </footer>
    </div>
  );
}
