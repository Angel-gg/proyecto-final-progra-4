import './globals.css';

export const metadata = {
  title: 'El Surtidor Cochabambino | Sistema Digital de Control y Gestión',
  description: 'Sistema Digital de Control y Gestión para Surtidores de Gasolina en Cochabamba con Lógica de Karnaugh, Sensores Binarios y Aritmética Binaria.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
