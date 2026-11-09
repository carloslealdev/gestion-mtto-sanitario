import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { statusConfig, type EppDetailData } from './constants';

export function EppReserveDetailDialog({
  reservation,
  getEPPName,
  onClose,
}: {
  reservation: EppDetailData | null;
  getEPPName: (code: string) => string;
  onClose: () => void;
}) {
  return (
    <Dialog open={reservation !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de Reserva de EPPs</DialogTitle>
        </DialogHeader>
        {reservation && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trabajador:</span>
                <p className="font-medium">{reservation.workerName}</p>
                <p className="text-muted-foreground text-xs">
                  {reservation.workerCedula}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <p className="font-medium">{reservation.createdAt}</p>
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
                EPPs Solicitados:
              </span>
              <div className="mt-2 space-y-2">
                {reservation.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>
                      {getEPPName(item.epp)}
                      {item.talla ? ` (Talla ${item.talla})` : ''}
                    </span>
                    <Badge variant="secondary">
                      Cantidad: {item.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {reservation.status === 'retirada_parcial' &&
              reservation.receivedItems && (
                <div>
                  <span className="text-muted-foreground font-medium">
                    EPPs Recibidos:
                  </span>
                  <div className="mt-2 space-y-2">
                    {reservation.receivedItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200"
                      >
                        <span>
                          {getEPPName(item.epp)}
                          {item.talla ? ` (Talla ${item.talla})` : ''}
                        </span>
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
