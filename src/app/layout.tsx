import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "خادم إدارة المهام API",
  description: "خادم المزامنة السحابية لتطبيق إدارة المهام مع PostgreSQL ومصادقة Google",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f7f9fd", color: "#191c1f" }}>
        {children}
      </body>
    </html>
  );
}
