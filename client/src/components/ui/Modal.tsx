import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}): ReactElement {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="glass-panel max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[rgba(0,212,255,0.2)] shadow-glow"
          >
            <div className="flex items-center justify-between border-b border-[rgba(0,212,255,0.12)] px-4 py-3">
              <h2 id="modal-title" className="font-display text-lg text-nexus-text">
                {title}
              </h2>
              <Button
                type="button"
                variant="ghost"
                className="!p-2"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[calc(85vh-56px)] overflow-y-auto p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
