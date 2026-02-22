import type { Metadata } from 'next'
import { Providers } from '@/providers'
import './globals.css'

const URL = process.env.NEXT_PUBLIC_URL ?? 'https://paycheck.vercel.app'
const NAME = 'Paycheck'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${NAME} — Get Paid to Build`,
    description: 'Track your Neynar score, Builder Score, and earn ETH for shipping on Base.',
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: `${URL}/hero.png`,
        button: {
          title: `Launch ${NAME} 💸`,
          action: {
            type: 'launch_frame',
            name: NAME,
            url: URL,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: '#0A0A0F',
          },
        },
      }),
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
