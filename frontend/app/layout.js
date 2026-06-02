import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export const metadata = {
  title: "ForceEquals AI Reports",
  description: "An interactive, AI-powered report and analytics generation dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className={`${inter.className} h-full w-full antialiased bg-[#fafaf8] text-[#171717]`}>
        {children}
      </body>
    </html>
  );
}
