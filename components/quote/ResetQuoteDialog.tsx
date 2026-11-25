"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

type ResetQuoteDialogProps = {
  open: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ResetQuoteDialog({
  open,
  confirmLabel = "Reinitialiser",
  onConfirm,
  onCancel,
}: ResetQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Vider le devis en cours ?</DialogTitle>
          <DialogDescription>
            Les lignes, le client et la conversation seront supprimes. Cette
            action est irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Conserver
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            <Trash2 />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
