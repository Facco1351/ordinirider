import './globals.css'

export const metadata = {
  title: 'RiderDash',
  description: 'Traccia le tue consegne, guadagni e statistiche',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#08080b',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
