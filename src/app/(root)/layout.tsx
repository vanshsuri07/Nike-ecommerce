// import type { Metadata } from "next";
// import {Jost} from "next/font/google"
// import "../globals.css";

// const jost = Jost({
//   variable: "--font-jost",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Nike",
//   description: "An e-commerce platform for Nike products.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${jost.className} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }


import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-light-100">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}