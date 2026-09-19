import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata = {
  title: "ACC Career Club",
  description: "Adamjee Cantonment College Career Club is a club in Adamjee Cantonment College",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <div>
            <Header />
          </div>
          <div className="min-h-screen">{children}</div>
          <div>
            <Footer />
          </div>
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
