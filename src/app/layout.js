import './globals.css'
import AppNavbar from '@/components/AppNavbar'

export const metadata = {
  title: 'StoneBots Panels',
  description: 'Monitor and manage your Discord bots from one dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-stone-950 text-stone-100 flex flex-col">
        <AppNavbar />
        {children}
      </body>
    </html>
  )
}
