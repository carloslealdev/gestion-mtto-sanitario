import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import type { EPPReservationItem } from '@/types/epp';

export function EppRecibidaParcialDialog({
  modal,
  receivedItems,
  getEPPName,
  onClose,
  onQuantityChange,
  onRemoveItem,
  onFinalize,
}: {
  modal: { id: string; items: EPPReservationItem[] } | null;
  receivedItems: EPPReservationItem[];
  getEPPName: (code: string) => string;
  onClose: () => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onFinalize: () => void;
}) {
  return (
    <Dialog open={modal !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibida Parcial - Seleccionar items</DialogTitle>
        </DialogHeader>
        {modal && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona los items que fueron recibidos. Los items eliminados no
              fueron recibidos.
            </p>
            <div className="space-y-2">
              {receivedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 bg-muted rounded"
                >
                  <span>
                    {getEPPName(item.epp)}
                    {item.talla ? ` (Talla ${item.talla})` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(index, Number(e.target.value))
                      }
                      className="w-20 text-center"
                    />
                    <span className="text-xs text-muted-foreground">
                      / {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {receivedItems.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No hay items remaining. Todos los items fueron rechazados.
              </p>
            )}
            <div className="flex gap-2 pt-4 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={onFinalize}>Finalizar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
