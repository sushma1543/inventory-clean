export const metadata = {
  title: "Sushma Bazaar",
  description: "Sushma created marketplace with Indian-style deals and inventory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}