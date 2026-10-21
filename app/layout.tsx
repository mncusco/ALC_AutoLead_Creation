import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: "ALC AutoLead Creation",
  description: "Multi-tenant content automation platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
