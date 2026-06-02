import { Toaster } from "@/components/ui/sonner";
import ClientLayout from "./ClientLayout";
import "./globals.css";



export const metadata = {
  title: "Client Portal | Devkarnel CRM",
  description: "Manage your projects, track progress, and collaborate with the Devkarnel team in real-time.",
};
export default function RootLayout({ children }) {
  return (
    <html
      // suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
      lang="en"
      className="h-full overflow-x-clip antialiased"
    >
      <body
        suppressHydrationWarning={true}
        className="flex min-h-dvh min-w-0 flex-col overflow-x-clip"
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
