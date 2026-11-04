// import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { Provider } from '@/components/provider';
import './global.css';

const GA_ID = 'G-S1T8DCK1Q7';

// const sans = IBM_Plex_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-sans',
// });

// const mono = IBM_Plex_Mono({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-ibm-plex-mono',
// });

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
