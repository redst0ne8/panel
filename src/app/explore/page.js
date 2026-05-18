import Link from 'next/link'

export default function ExplorePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <section className="max-w-4xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors mb-12 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-6">
          Explore the Bot
        </h1>

        <div className="border-t border-stone-800 mb-10" />

        <div className="prose prose-invert max-w-none text-stone-400 text-lg leading-relaxed space-y-6">
          <p>
            [Placeholder — write a longer description here. Talk about the bot in detail:
            what modules are included, how customization works, pricing tiers, support,
            setup process, etc. This is the place to really sell the product.]
          </p>

          <h2 className="text-2xl font-bold text-stone-100 mt-12 mb-4">Modules</h2>
          <p>
            [List the modules here with descriptions: moderation, tickets, logging,
            staff management, economy, fun, erlc integration, roblox verification,
            backups, command logging, welcomer, and products.]
          </p>

          <h2 className="text-2xl font-bold text-stone-100 mt-12 mb-4">Customization</h2>
          <p>
            [Describe how buyers can customize the bot — config files, removing
            modules, setting up their own branding, etc.]
          </p>

          <h2 className="text-2xl font-bold text-stone-100 mt-12 mb-4">Pricing</h2>
          <p>
            [Write about pricing tiers: full package at 1.5k robux, individual module
            pricing, etc.]
          </p>

          <h2 className="text-2xl font-bold text-stone-100 mt-12 mb-4">Support</h2>
          <p>
            [Describe what support is included, how to get help, response times, etc.]
          </p>
        </div>
      </section>
    </div>
  )
}
