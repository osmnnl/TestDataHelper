import "./Toast.css";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

/**
 * Toast bileşeni - visible prop ile kontrol edilir
 * setState effect içinde çağrılmaz, doğrudan prop'tan türetilir
 */
export function Toast({ message, visible, onHide }: ToastProps) {
  // Visible değiştiğinde auto-hide için timeout
  if (visible) {
    setTimeout(() => {
      onHide();
    }, 1500);
  }

  if (!visible) return null;

  return (
    <div className="toast toast-visible">
      <span className="toast-icon">✓</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}
