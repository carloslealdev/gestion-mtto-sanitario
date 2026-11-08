import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Supply } from '@/types/supply';
import {
  getItemLabel,
  statusConfig,
  workTeamLabels,
  type DetailReservationData,
} from './constants';

export function ReservaDetailDialog({
  reservation,
  supplies,
  onClose,
}: {
  reservation: DetailReservationData | null;
  supplies: Supply[];
  onClose: () => void;
}) {
  return (
    <Dialog open={reservation !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de Reserva</DialogTitle>
        </DialogHeader>
        {reservation && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Grupo de Trabajo:</span>
                <p className="font-medium">
                  {workTeamLabels[reservation.team]} ({reservation.team})
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <p className="font-medium">{reservation.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <p className="font-medium">
                  <span
                    className={`text-xs text-white px-2 py-1 rounded ${
                      statusConfig[reservation.status].color
                    }`}
                  >
                    {statusConfig[reservation.status].label}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">
                Insumos Solicitados:
              </span>
              <div className="mt-2 space-y-2">
                {reservation.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>{getItemLabel(item.item, supplies)}</span>
                    <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </div>
            {reservation.status === 'retirada_parcial' &&
              reservation.receivedItems && (
                <div>
                  <span className="text-muted-foreground font-medium">
                    Insumos Recibidos:
                  </span>
                  <div className="mt-2 space-y-2">
                    {reservation.receivedItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200"
                      >
                        <span>{getItemLabel(item.item, supplies)}</span>
                        <Badge variant="default" className="bg-green-500">
                          Recibido: {item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
