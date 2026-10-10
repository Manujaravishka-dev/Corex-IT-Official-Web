import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Corex IT",
  description:
    "Terms & Conditions for Corex IT — acceptance of terms, services, intellectual property, payment terms, confidentiality, liability, warranties, termination, governing law and contact.",
};

const sections = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    number: "1",
    content: [
      "By accessing or using the Corex IT website or services, you agree to be bound by these Terms & Conditions. If you do not agree with these Terms, please do not use our website or services.",
      "We may update these Terms from time to time. Continued use of our website or services after any changes constitutes acceptance of the updated Terms. Please review this page periodically for updates.",
    ],
  },
  {
    id: "services",
    title: "Services",
    number: "2",
    content: [
      "Corex IT provides software development, web and mobile application development, UI/UX design, cloud and DevOps, and IT consulting services. Service scope, timelines, and deliverables are agreed upon through proposals, statements of work, or written agreements.",
      "We reserve the right to modify, suspend, or discontinue any service or feature. Where applicable, affected clients will be notified of significant changes in advance.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    number: "3",
    content: [
      "Unless otherwise stated in a written agreement, the Corex IT website, including its design, graphics, logos, branding, text, and other content, is owned by Corex IT or its licensors and is protected by applicable intellectual property laws.",
      "Ownership or licensing of client-specific deliverables, source code, and assets will be determined by the applicable project agreement. You may not reproduce, modify, distribute, or use our content without prior written permission, except as permitted for normal website use.",
    ],
  },
  {
    id: "client-responsibilities",
    title: "Client Responsibilities",
    number: "4",
    content: [
      "When engaging our services or submitting information through our website, you agree to provide accurate, complete, and up-to-date information.",
      "You are responsible for maintaining the confidentiality of any credentials or access provided by Corex IT and for all activities conducted through your account. Any unauthorized use should be reported to us promptly.",
      "You agree not to use our website or services for any unlawful, fraudulent, abusive, or unauthorized purpose and to comply with all applicable laws and regulations.",
    ],
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    number: "5",
    content: [
      "Fees, payment schedules, and project milestones will be outlined in the applicable proposal, quotation, or invoice. Payments are due according to the agreed terms. Late payments may result in reminders, applicable charges, or suspension of work until outstanding amounts are settled.",
      "Any estimates are based on the agreed scope at the time of quotation. Changes to the scope, additional requirements, or third-party costs may affect the final fee. Any such changes will be communicated and agreed upon before additional work proceeds.",
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    number: "6",
    content: [
      "Both parties agree to protect and keep confidential any non-public information shared during the course of a project or business relationship. This may include business information, source code, designs, technical data, and other information reasonably considered confidential.",
      "Confidential information will not be disclosed to third parties without prior written consent, except where required by law or shared with employees, contractors, or professional advisers who require access and are bound by appropriate confidentiality obligations.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    number: "7",
    content: [
      "To the fullest extent permitted by applicable law, Corex IT shall not be liable for any indirect, incidental, special, or consequential loss or damage, including loss of profits, revenue, data, or business arising from the use of our website or services.",
      "To the extent permitted by law, Corex IT’s total liability for any claim relating to our website or services shall not exceed the amount paid by the client for the specific service giving rise to the claim during the three months preceding the claim.",
    ],
  },
  {
    id: "warranties-and-disclaimers",
    title: "Warranties and Disclaimers",
    number: "8",
    content: [
      "Our website and services are provided on an “as is” and “as available” basis, without warranties of any kind, whether express or implied, to the fullest extent permitted by applicable law.",
      "We do not guarantee that our website or services will be uninterrupted, error-free, secure, or free from harmful components, or that any defects will be corrected. While we make reasonable efforts to provide accurate and up-to-date information, we do not guarantee that all content is complete, accurate, or suitable for every purpose.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    number: "9",
    content: [
      "Corex IT may suspend or terminate your access to our website or services if you breach these Terms or where required by applicable law. You may discontinue use of our website or services at any time.",
      "Upon termination, your right to access or use our website and services will cease immediately. Provisions that by their nature should survive termination, including intellectual property, confidentiality, and limitation of liability, will remain in effect.",
    ],
  },
  // {
  //   id: "governing-law",
  //   title: "Governing Law",
  //   number: "10",
  //   content: [
  //     "These Terms shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka, without regard to its conflict of law principles.",
  //     "Any dispute arising out of or in connection with these Terms or your use of the website or services shall be submitted to the competent courts located in Colombo, Sri Lanka.",
  //   ],
  // },
  {
    id: "contact",
    title: "Contact",
    number: "11",
    content: [
      "If you have any questions or require clarification regarding these Terms & Conditions, please contact Corex IT. We are happy to assist with any questions regarding our services, policies, or terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Hero — premium blue consistent with Blog/Contact heroes */}
      <section className="relative overflow-hidden bg-[#071A33] border-b border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071A33] via-[#0A2450] to-[#040E1F]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_75%_20%,rgba(0,87,184,0.18),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_15%_75%,rgba(59,130,246,0.10),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute -top-24 right-[-8%] w-[560px] h-[560px] rounded-full bg-[#0057B8]/18 blur-[60px]" />
          <div className="absolute -bottom-24 left-[-6%] w-[480px] h-[480px] rounded-full bg-white/[0.04] blur-[40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/50 mb-3">Legal</p>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white max-w-[720px]">
            Terms & Conditions
          </h1>
          <p className="text-[13px] leading-[1.6] text-white/60 mt-3 max-w-[560px]">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Please read these terms carefully before using our website and services.
          </p>
        </div>
      </section>

      {/* Content with Table of Contents */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Table of Contents — sticky on desktop, stacked on mobile */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[12px] bg-[#F8F8F8] border border-[#E5E7EB] p-5 md:p-6">
                <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-4">Contents</h2>
                <nav className="space-y-1.5" aria-label="Table of contents">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-3 py-1.5 text-[13px] leading-[1.4] text-slate-600 hover:text-[#0057B8] transition-colors group"
                    >
                      <span className="text-[11px] font-semibold tracking-[0.06em] text-slate-400 group-hover:text-[#0057B8] transition-colors">
                        {s.number}.
                      </span>
                      <span className="flex-1">{s.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
              <div className="hidden lg:block mt-4 rounded-[12px] bg-[#EAF4FF] border border-[#D4E8FF] p-4">
                <p className="text-[12px] font-semibold text-[#071A33]">Need help?</p>
                <p className="text-[12px] leading-[1.6] text-slate-600 mt-1">Questions about these terms? We are here to clarify.</p>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0057B8] hover:text-[#003B7A] mt-2">
                  Contact us
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Document */}
          <div className="lg:col-span-8">
            <div className="max-w-[760px]">
              <div className="space-y-0 divide-y divide-slate-100">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28 py-8 first:pt-0">
                    <h2 className="flex items-baseline gap-3 text-[18px] md:text-[20px] font-bold tracking-[-0.02em] text-[#071A33]">
                      <span className="text-[13px] font-bold tracking-[0.06em] text-[#0057B8]">{section.number}.</span>
                      {section.title}
                    </h2>
                    <div className="mt-3 space-y-4">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx} className="text-[14.5px] leading-[1.8] text-slate-600">
                          {paragraph}
                        </p>
                      ))}
                      {section.id === "contact" && (
                        <div className="mt-5 rounded-[12px] bg-[#EAF4FF] border border-[#D4E8FF] p-5">
                          <p className="text-[13px] leading-[1.7] text-slate-700">
                            <span className="font-semibold text-[#071A33]">Corex IT</span>
                            <br />
                            Colombo, Sri Lanka
                            <br />
                            Email:{" "}
                            <a href="mailto:info@corexitsolutions.com" className="text-[#0057B8] hover:text-[#003B7A] transition-colors">
                              info@corexitsolutions.com
                            </a>
                            <br />
                            Website:{" "}
                            <Link
                              href="https://corexitsolutions.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0057B8] hover:text-[#003B7A] transition-colors"
                            >
                              corexitsolutions.com
                            </Link>

                            <br />

                            Contact:{" "}
                            <a
                              href="https://wa.me/94784600136"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0057B8] hover:text-[#003B7A] transition-colors"
                            >
                              078 460 0136
                            </a>

                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}