import type { Metadata } from 'next'
import { Providers } from '@/providers'
import './globals.css'

const URL = process.env.NEXT_PUBLIC_URL ?? 'https://paycheck.vercel.app'
const NAME = 'Paycheck'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${NAME} — Get Paid to Build`,
    description: 'Track your Neynar score, Builder Score, and earn ETH for shipping on Base.',
    verification: {
      other: {
        'talentapp:project_verification': 'f86b68df629f6ac7af584584b2a3f5110982b8231aa9859e937a4b47e11830bbf3686f6d1a68aebdb9db4f86e2ca9e5871a812f287b45c1a32ca32678c790700',
        'coinbase-verification': 'bc_hi2cipof',
      }
    },
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
      <head>
        <meta name="talentapp:project_verification" content="f86b68df629f6ac7af584584b2a3f5110982b8231aa9859e937a4b47e11830bbf3686f6d1a68aebdb9db4f86e2ca9e5871a812f287b45c1a32ca32678c790700" />
        <meta name="coinbase-verification" content="bc_hi2cipof" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
