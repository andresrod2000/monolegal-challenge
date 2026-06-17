import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monolegal — Dashboard de Facturación',
  description: 'Panel de visualización de facturas y recordatorios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
