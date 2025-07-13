'use client';

import './globals.css';
import Providers from './providers';
import ThemeRegistry from './ThemeRegistry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              // Check if theme exists in localStorage
              const storedTheme = localStorage.getItem('theme-mode');
              if (storedTheme === 'dark' || 
                 (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
            })();
          `,
          }}
        />
      </head>
      <body>
        <ThemeRegistry>
          <Providers>{children}</Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
