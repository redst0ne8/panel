import './globals.css'

export const metadata = {
  title: 'StoneBots Editor',
  description: 'Remote code editor for Raspberry Pi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-stone-950 text-stone-100">
        {children}
      </body>
    </html>
  )
}