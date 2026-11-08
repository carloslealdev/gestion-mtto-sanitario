import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Supply } from '@/types/supply';
import type { ReservationRequest } from '@/types/reservation';
import {
  getItemLabel,
  workTeamLabels,
  type RequestDetailData,
} from './constants';

export function SolicitudDetailDialog({
  request,
  requests,
  isAdmin,
  supplies,
  onClose,
  onApprove,
  onReject,
}: {
  request: RequestDetailData | null;
  requests: ReservationRequest[];
  isAdmin: boolean;
  supplies: Supply[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Dialog open={request !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud de Reserva</DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Grupo de Trabajo:</span>
                <p className="font-medium">
                  {workTeamLabels[request.team]} ({request.team})
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <p className="font-medium">{request.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <p className="font-medium">
                  <span
                    className={`text-xs text-white px-2 py-1 rounded ${
                      request.status === 'pendiente'
                        ? 'bg-yellow-500'
                        : request.status === 'aprobada'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                    }`}
                  >
                    {request.status === 'pendiente'
                      ? 'Pendiente'
                      : request.status === 'aprobada'
                        ? 'Aprobada'
                        : 'Rechazada'}
                  </span>
                </p>
              </div>
            </div>
            {request.status === 'aprobada' ? (
              <>
                <div>
                  <span className="text-muted-foreground font-medium">
                    Insumos Aprobados:
                  </span>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const current = requests.find((r) => r.id === request.id);
                      const approvedItems =
                        current?.approvedItems || request.items;
                      return approvedItems.map((item, i) => {
                        const requestedItem = request.items.find(
                          (s) => s.item === item.item,
                        );
                        const hasDifference =
                          requestedItem &&
                          requestedItem.quantity !== item.quantity;
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200"
                          >
                            <span>{getItemLabel(item.item, supplies)}</span>
                            <div className="flex items-center gap-2">
                              {hasDifference && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {requestedItem?.quantity}
                                </span>
                              )}
                              <Badge
                                variant="default"
                                className="bg-green-500"
                              >
                                Aprobado: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                {(() => {
                  const current = requests.find((r) => r.id === request.id);
                  const approvedItems = current?.approvedItems || request.items;
                  const hasDifference = request.items.some((s) => {
                    const approved = approvedItems.find(
                      (a) => a.item === s.item,
                    );
                    return !approved || approved.quantity !== s.quantity;
                  });
                  if (!hasDifference) return null;
                  return (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        Insumos Solicitados (original):
                      </span>
                      <div className="mt-2 space-y-2">
                        {request.items.map((item, i) => {
                          const approved = approvedItems.find(
                            (a) => a.item === item.item,
                          );
                          if (approved && approved.quantity === item.quantity)
                            return null;
                          return (
                            <div
                              key={i}
                              className="flex justify-between items-center p-2 bg-muted rounded opacity-60"
                            >
                              <span>{getItemLabel(item.item, supplies)}</span>
                              <Badge variant="secondary">
                                Solicitado: {item.quantity}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div>
                <span className="text-muted-foreground font-medium">
                  Insumos Solicitados:
                </span>
                <div className="mt-2 space-y-2">
                  {request.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>{getItemLabel(item.item, supplies)}</span>
                      <Badge variant="secondary">
                        Cantidad: {item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {request.status === 'pendiente' && isAdmin && (
              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onReject(request.id)}
                >
                  Rechazar
                </Button>
                <Button onClick={() => onApprove(request.id)}>
                  Aprobar y crear reserva
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
