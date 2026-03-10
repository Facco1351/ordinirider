import './globals.css'

export const metadata = {
  title: 'RiderDash',
  description: 'Traccia le tue consegne, guadagni e statistiche',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#08080b',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
