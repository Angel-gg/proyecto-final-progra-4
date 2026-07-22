import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'El Surtidor Cochabambino | Sistema Digital de Control y Gestión',
  description:
    'Sistema Digital de Control y Gestión para Surtidores de Gasolina en Cochabamba con Lógica de Karnaugh, Sensores Binarios y Aritmética Binaria.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        {/* Toast notifications globales (Sonner) */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e2d4a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f3f4f6',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.875rem',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
