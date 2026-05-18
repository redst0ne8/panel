import Link from 'next/link'

const modules = [
  { name: 'ER:LC', desc: 'This module has lots of integration with your ER:LC Private Server using the API Key you have from the server.', price: '300 Robux' },
  { name: 'Moderation', desc: 'This module allows you to moderate your server!', price: '350 Robux' },
  { name: 'Backups', desc: 'This module allows creating full server backups as a raid prevention and protection measure.', price: '300 Robux' },
  { name: 'Server Logs', desc: 'This module configures a logging system to log server, chat, and other actions.', price: '150 Robux' },
  { name: 'Staff Management', desc: 'This module provides commands and functionality to manage a staff team.', price: '250 Robux' },
  { name: 'Fun Commands', desc: 'This adds a lot of fun commands and silly things for your members to have fun with, including an economy system.', price: '200 Robux' },
  { name: 'Tickets', desc: 'This adds a full ticket system supported up to 5 ticket panels.', price: '600 Robux' },
  { name: 'Command Logs', desc: 'This is an expansion to the logging module but can work standalone. This logs all commands, buttons, modals, etc. that are used by anyone in your server.', price: '100 Robux' },
  { name: 'Roblox Verification', desc: 'This allows users to verify their roblox account for your server, providing a lockout system so you have to verify to see channels.', price: '250 Robux' },
  { name: 'Welcomer', desc: 'This adds a simple member welcomer to your server.', price: '50 Robux' },
  { name: 'Products', desc: 'This adds a full product server style setup with a list, purchase links, and more!', price: '200 Robux' },
  { name: 'Custom Commands', desc: 'Register your own commands for your bot! Price is variable in consideration of how many, depth of command, and features.', price: '100 Robux each' },
]

function Divider() {
  return <div className="border-t border-stone-800 my-16" />
}

function SaveBadge() {
  return (
    <span className="inline-block bg-green-600/20 text-green-400 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
      SAVE!
    </span>
  )
}

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

        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-8 leading-tight">
          All New Full-Purpose
        </h1>

        <p className="text-stone-400 text-lg leading-relaxed">
          This bot has been remastered and worked on tirelessly, allowing for many new features
          to come out and work at their best potential.
        </p>

        <Divider />

        <h2 className="text-3xl font-bold text-stone-100 mb-4">Modules &amp; Features</h2>
        <p className="text-stone-400 mb-10">This bot has many modules. You can find them below.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="py-3 pr-4 text-stone-300 font-semibold text-sm uppercase tracking-wider">Name</th>
                <th className="py-3 pr-4 text-stone-300 font-semibold text-sm uppercase tracking-wider">Description</th>
                <th className="py-3 text-stone-300 font-semibold text-sm uppercase tracking-wider whitespace-nowrap">Module Price</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod, i) => (
                <tr key={i} className="border-b border-stone-800/60 last:border-0">
                  <td className="py-4 pr-4 text-stone-100 font-medium whitespace-nowrap">{mod.name}</td>
                  <td className="py-4 pr-4 text-stone-400 text-sm">{mod.desc}</td>
                  <td className="py-4 text-stone-300 text-sm whitespace-nowrap">{mod.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-stone-500 text-sm mt-6">
          All pricing of modules is for adding the module to an existing bot ONLY. Modules in a bundle are priced differently.
        </p>

        <Divider />

        <h2 className="text-3xl font-bold text-stone-100 mb-6">Pricing</h2>
        <p className="text-stone-400 mb-10 leading-relaxed">
          The pricing of the bot is very unique. The base bot is 400 Robux on its own, with NO modules,
          albeit a bot and just a bot isn&apos;t very helpful. Which is why we offer{' '}
          <strong className="text-stone-200">Bundles!</strong> The bundles are able to be modified,
          however if no bundle fits you, you can always spec out your own bot! 

          {' '}<strong className="text-stone-200">All pricing is subject to change at any time.</strong>
        </p>

        <h3 className="text-2xl font-bold text-stone-100 mb-6">Bundles</h3>

        <div className="space-y-6">
          <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6">
            <h4 className="text-xl font-bold text-stone-100 mb-2">
              All Features! Full Bundle
              <span className="ml-2 text-stone-400 font-normal text-base">&mdash; 2,250 Robux</span>
            </h4>
            <ul className="text-stone-400 space-y-1 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#x2022;</span>
                <span>Comes with Base Bot and all modules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#x2713;</span>
                <span className="text-green-400 font-semibold">SAVE 900 ROBUX!</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6">
            <h4 className="text-xl font-bold text-stone-100 mb-2">
              Product Shop Bundle
              <span className="ml-2 text-stone-400 font-normal text-base">&mdash; 1,350 Robux</span>
            </h4>
            <ul className="text-stone-400 space-y-1 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#x2022;</span>
                <span>Comes with Bot, Products, Tickets, Logging + Command Logs, and Roblox Verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#x2713;</span>
                <span className="text-green-400 font-semibold">SAVE 350 ROBUX!</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6">
            <h4 className="text-xl font-bold text-stone-100 mb-2">
              ER:LC Minimalist Bundle
              <span className="ml-2 text-stone-400 font-normal text-base">&mdash; 950 Robux</span>
            </h4>
            <ul className="text-stone-400 space-y-1 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#x2022;</span>
                <span>Comes with Bot, ER:LC, Logging + Command Logs, Welcomer, and Roblox Verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#x2713;</span>
                <span className="text-green-400 font-semibold">SAVE 300 ROBUX!</span>
              </li>
            </ul>
          </div>
        </div>

        <Divider />

        <h2 className="text-3xl font-bold text-stone-100 mb-6">Purchasing</h2>
        <p className="text-stone-400 text-lg leading-relaxed">
          Want to purchase one of your own?{' '}
          <span className="text-stone-200 font-semibold">Contact redst0ne8 on Discord!</span>
        </p>
      </section>
    </div>
  )
}
