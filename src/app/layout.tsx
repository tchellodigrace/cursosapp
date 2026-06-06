import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Sua Plataforma de Cursos', template: '%s | Sua Plataforma' },
  description: 'Aprenda com os melhores instrutores do Brasil.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sua Plataforma de Cursos',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
