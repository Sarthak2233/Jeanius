import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JEANIUS — Handmade Denim Works',
  description: 'Precision handmade denim craftsmanship. Order-Made (OM) & Limited Drop collections.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
