// src/app/layout.tsx
import "../../styles/globals.css";
import Providers from "./providers";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
