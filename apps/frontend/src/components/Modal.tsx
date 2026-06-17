interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-dark/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-sm border border-brand-medium bg-surface p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-brand-muted transition-colors hover:text-brand-dark"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
