// app/layout.js
import { Geist, Geist_Mono, Saira, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import ToastProvider from "./components/ToastProvider";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const saira = Saira({
  subsets: ["latin"],
  variable: "--font-saira",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  manifest: "/manifest.json",
  title: "ACC Career Club",
  description:
    "Adamjee Cantonment College Career Club is a club in Adamjee Cantonment College",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${saira.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 min-h-screen">{children}</main>
          <Footer />
          <ToastProvider />

          {/* Spacer for the fixed mobile bottom bar — only on mobile */}
          <div className="md:hidden h-14" aria-hidden="true" />
        </AuthProvider>
      </body>
    </html>
  );
}