import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 3000,
        className: "mt-16", // Add margin to push all toasts down below navbar
        style: {
          zIndex: 1000, // Ensure toasts are above buttons but below modals
        }
      }}
    />
  </>
);
