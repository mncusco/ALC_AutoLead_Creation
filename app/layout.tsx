import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "ALC AutoLead Creation",
  description: "Multi-tenant content automation platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
