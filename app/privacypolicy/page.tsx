import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Privacy Policy - Ardra Bot Hub",
  description: "Learn how the Ardra Bot Hub Chrome extension collects, stores, and protects your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100svh] bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-20">
        <article className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-3xl font-semibold text-white">
              Privacy Policy - Ardra Bot Hub (Chrome Extension)
            </h1>
            <p className="text-lg text-white/80">Effective date: October 6, 2025</p>
          </header>

          <section aria-labelledby="responsible">
            <div className="space-y-3">
              <h2 id="responsible" className="text-2xl font-semibold text-white">
                Responsible Party
              </h2>
              <p className="text-white/70">
                This policy applies to the Ardra Bot Hub browser extension maintained by the Ardra team. For inquiries,
                contact{" "}
                <Link href="mailto:manager@ardra.xyz" className="text-cyan-300 underline underline-offset-4">
                  manager@ardra.xyz
                </Link>
                .
              </p>
            </div>
          </section>

          <section aria-labelledby="data-collect">
            <div className="space-y-3">
              <h2 id="data-collect" className="text-2xl font-semibold text-white">
                Data We Collect
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-white/70">
                <li>
                  API keys and bot parameters you provide in the extension popup. These values are stored locally using
                  <code className="ml-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-white/80">
                    chrome.storage.local
                  </code>
                  .
                </li>
                <li>
                  We do not collect your name, email, financial data, location, browsing history, or the content of the
                  pages you visit.
                </li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="data-use">
            <div className="space-y-3">
              <h2 id="data-use" className="text-2xl font-semibold text-white">
                How We Use the Data
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-white/70">
                <li>
                  API keys are only used by the extension&apos;s background service to authenticate direct calls to the
                  official APIs at https://fapi.asterdex.com and https://api.backpack.exchange.
                </li>
                <li>Parameters such as maximum margin, take profit, and stop loss are applied when executing the bots.</li>
                <li>
                  No information is sent or synchronized with Ardra servers or third parties. We do not perform analytics,
                  advertising, or data sales.
                </li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="chrome-permissions">
            <div className="space-y-3">
              <h2 id="chrome-permissions" className="text-2xl font-semibold text-white">
                Chrome Permissions
              </h2>
              <dl className="space-y-3 text-white/70">
                <div>
                  <dt className="font-semibold text-white">storage</dt>
                  <dd>Stores your keys and settings locally.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">tabs and scripting</dt>
                  <dd>Injects the bridge into Ardra pages only when you request it so the site recognizes the extension.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">
                    declarativeNetRequest and declarativeNetRequestWithHostAccess
                  </dt>
                  <dd>Adjusts request headers for https://api.backpack.exchange as required by those APIs.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">host_permissions</dt>
                  <dd>
                    Restricted to https://www.ardra.xyz/*, https://www.asterdex.com/en*, https://fapi.asterdex.com/*, and
                    https://api.backpack.exchange/*. We do not monitor other sites or content.
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="storage-retention">
            <div className="space-y-3">
              <h2 id="storage-retention" className="text-2xl font-semibold text-white">
                Storage and Retention
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-white/70">
                <li>All data remains in your browser. No backups exist outside your device.</li>
                <li>
                  You can delete keys and parameters at any time from the extension popup by choosing{" "}
                  <span className="font-semibold text-white">Settings -&gt; Clear</span>, or by uninstalling the extension (
                  <code className="ml-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-white/80">
                    chrome://extensions
                  </code>
                  ), which permanently removes the stored information.
                </li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="sharing">
            <div className="space-y-3">
              <h2 id="sharing" className="text-2xl font-semibold text-white">
                Sharing
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-white/70">
                <li>We do not share data with third parties. Traffic occurs directly between your browser and the APIs you authorize.</li>
                <li>We comply with the Asterdex and Backpack API terms; no additional data is transmitted.</li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="security">
            <div className="space-y-3">
              <h2 id="security" className="text-2xl font-semibold text-white">
                Security
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-white/70">
                <li>Keys are stored using Chrome Extension Platform capabilities. We do not have remote access to them.</li>
                <li>We recommend protecting your device and using keys generated specifically for automation.</li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="updates">
            <div className="space-y-3">
              <h2 id="updates" className="text-2xl font-semibold text-white">
                Updates to This Policy
              </h2>
              <p className="text-white/70">
                If we update the extension or our privacy practices, we will publish the new version on this page and
                indicate the effective date. Continued use after an update means you agree to the new terms.
              </p>
            </div>
          </section>

          <section aria-labelledby="contact">
            <div className="space-y-3">
              <h2 id="contact" className="text-2xl font-semibold text-white">
                Contact
              </h2>
              <p className="text-white/70">
                Email{" "}
                <Link href="mailto:manager@ardra.xyz" className="text-cyan-300 underline underline-offset-4">
                  manager@ardra.xyz
                </Link>{" "}
                or visit{" "}
                <Link href="https://www.ardra.xyz" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">
                  https://www.ardra.xyz
                </Link>{" "}
                to reach Ardra Labs.
              </p>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
