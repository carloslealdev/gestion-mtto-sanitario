import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { EPPReservationRequest } from '@/types/epp';
import type { EppRequestDetailData } from './constants';

export function EppSolicitudDetailDialog({
  request,
  eppRequests,
  isAdmin,
  getEPPName,
  onClose,
  onApprove,
  onReject,
}: {
  request: EppRequestDetailData | null;
  eppRequests: EPPReservationRequest[];
  isAdmin: boolean;
  getEPPName: (code: string) => string;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Dialog open={request !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud de EPPs</DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trabajador:</span>
                <p className="font-medium">{request.workerName}</p>
                <p className="text-muted-foreground text-xs">
                  {request.workerCedula}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <p className="font-medium">{request.createdAt}</p>
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
                    EPPs Aprobados:
                  </span>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const current = eppRequests.find(
                        (r) => r.id === request.id,
                      );
                      const approvedItems =
                        current?.approvedItems || request.items;
                      return approvedItems.map((item, i) => {
                        const requestedItem = request.items.find(
                          (s) => s.epp === item.epp,
                        );
                        const hasDifference =
                          requestedItem &&
                          (requestedItem.quantity !== item.quantity ||
                            requestedItem.talla !== item.talla);
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200"
                          >
                            <span>
                              {getEPPName(item.epp)}
                              {item.talla ? ` (Talla ${item.talla})` : ''}
                            </span>
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
                  const current = eppRequests.find((r) => r.id === request.id);
                  const approvedItems = current?.approvedItems || request.items;
                  const hasDifference = request.items.some((s) => {
                    const approved = approvedItems.find(
                      (a) => a.epp === s.epp,
                    );
                    return (
                      !approved ||
                      approved.quantity !== s.quantity ||
                      approved.talla !== s.talla
                    );
                  });
                  if (!hasDifference) return null;
                  return (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        EPPs Solicitados (original):
                      </span>
                      <div className="mt-2 space-y-2">
                        {request.items.map((item, i) => {
                          const approved = approvedItems.find(
                            (a) => a.epp === item.epp,
                          );
                          if (
                            approved &&
                            approved.quantity === item.quantity &&
                            approved.talla === item.talla
                          )
                            return null;
                          return (
                            <div
                              key={i}
                              className="flex justify-between items-center p-2 bg-muted rounded opacity-60"
                            >
                              <span>
                                {getEPPName(item.epp)}
                                {item.talla ? ` (Talla ${item.talla})` : ''}
                              </span>
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
                  EPPs Solicitados:
                </span>
                <div className="mt-2 space-y-2">
                  {request.items.map((item, i) => (
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
            )}
            {request.status === 'pendiente' && isAdmin && (
              <div className="flex gap-2 pt-4 justify-end">
                <Button variant="outline" onClick={() => onReject(request.id)}>
                  Rechazar
                </Button>
                <Button onClick={() => onApprove(request.id)}>
                  Aprobar y crear orden
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
