import './globals.css'
import AppNavbar from '@/components/AppNavbar'

export const metadata = {
  title: 'Bot Dashboard',
  description: 'Remote monitoring and control for Discord bots',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
        <AppNavbar />
        {children}
      </body>
    </html>
  )
}
