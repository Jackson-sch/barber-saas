import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#07080B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "BarberOS — El Sistema Operativo Moderno para Barberías",
  description:
    "Plataforma multi-tenant de gestión integral para barberías y salones de alta gama. Agenda interactiva, control de caja, POS, fichas técnicas de estilo y comisiones en tiempo real.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarberOS",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#090A0E] text-neutral-100 font-sans"
      >
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
