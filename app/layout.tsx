import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { NotificationProvider } from "@/context/NotificationContext";
import MobileBottomNav from "@/components/MobileBottomNav";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "อิ่มขนาด",
  description: "Reservation System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "อิ่มขนาด",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden selection:bg-orange-500 selection:text-white bg-[#FAF7F2] text-stone-800`}>
        {/* Production Clean Background */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#FAF7F2]">
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent"></div>
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-orange-200/25 filter blur-[120px]"></div>
          <div className="absolute top-[20%] left-[-5%] w-[35%] h-[35%] rounded-full bg-amber-200/25 filter blur-[120px]"></div>
        </div>

        {/* Global Context Provider */}
        <NotificationProvider>
          <RestaurantProvider>
              <div className="relative z-10 pb-16 md:pb-0">
                 {children}
              </div>
              <MobileBottomNav />
          </RestaurantProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}