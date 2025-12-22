import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "อิ่มขนาด",
  description: "Reservation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden selection:bg-pink-500 selection:text-white`}>
        {/* Liquid Background: พื้นหลังแบบเคลื่อนไหว */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400 mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400 mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400 mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Global Context Provider */}
        <RestaurantProvider>
            <div className="relative z-10">
               {children}
            </div>
        </RestaurantProvider>
      </body>
    </html>
  );
}