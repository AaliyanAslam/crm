import { Toaster } from "@/components/ui/sonner";
import ClientLayout from "./ClientLayout";
import "./globals.css";



export const metadata = {
  title: "CRM",
  description: "Manage your projects, track progress, and collaborate in real-time.",
};
export default function RootLayout({ children }) {
  return (
    <html
      // suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
      lang="en"
      className="h-full overflow-x-clip antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    function clean() {
      var els = document.querySelectorAll('[bis_skin_checked]');
      for (var i = 0; i < els.length; i++) els[i].removeAttribute('bis_skin_checked');
    }
    clean();
    if (typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === 'bis_skin_checked' && mutations[i].target && mutations[i].target.removeAttribute) {
            mutations[i].target.removeAttribute('bis_skin_checked');
          }
        }
      });
      obs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
    }
  } catch (e) {}
})();`,
          }}
        />
      </head>
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
