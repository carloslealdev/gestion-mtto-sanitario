export interface EPPDates {
  lastRenewal: string;
  nextRenewal: string;
  notOwned?: boolean;
}

export interface EPPs {
  casco: EPPDates;
  lentes: EPPDates;
  botas: EPPDates;
  auditivo: EPPDates;
  fullFace: EPPDates;
}

export interface Worker {
  firstName: string;
  lastName: string;
  cedula: string;
  fechaIngreso: string;
  workTeam: 'G1' | 'G2' | 'G3' | 'TN' | 'Sin asignar';
  role: 'trabajador-encargado' | 'trabajador-general';
  epps: EPPs;
}

function createEPPDates(
  lastRenewalDaysAgo: number,
  monthsUntilRenewal: number,
): EPPDates {
  const today = new Date();
  const lastRenewal = new Date(today);
  lastRenewal.setDate(lastRenewal.getDate() - lastRenewalDaysAgo);
  const nextRenewal = new Date(lastRenewal);
  nextRenewal.setMonth(nextRenewal.getMonth() + monthsUntilRenewal);
  return {
    lastRenewal: lastRenewal.toISOString(),
    nextRenewal: nextRenewal.toISOString(),
  };
}

function createWorker(
  firstName: string,
  lastName: string,
  cedula: string,
  workTeam: 'G1' | 'G2' | 'G3' | 'TN',
  role: 'trabajador-encargado' | 'trabajador-general',
  fechaIngresoYearsAgo: number,
  eppConfig: { daysAgo: number; monthsUntil: number }[],
): Worker {
  const today = new Date(2026, 4, 11);
  const fechaIngreso = new Date(today);
  fechaIngreso.setFullYear(fechaIngreso.getFullYear() - fechaIngresoYearsAgo);

  return {
    firstName,
    lastName,
    cedula,
    fechaIngreso: fechaIngreso.toISOString(),
    workTeam,
    role,
    epps: {
      casco: createEPPDates(eppConfig[0].daysAgo, eppConfig[0].monthsUntil),
      lentes: createEPPDates(eppConfig[1].daysAgo, eppConfig[1].monthsUntil),
      botas: createEPPDates(eppConfig[2].daysAgo, eppConfig[2].monthsUntil),
      auditivo: createEPPDates(eppConfig[3].daysAgo, eppConfig[3].monthsUntil),
      fullFace: createEPPDates(eppConfig[4].daysAgo, eppConfig[4].monthsUntil),
    },
  };
}

export const workers: Worker[] = [
  // G1
  createWorker(
    'Mario',
    'González',
    'V-12345678',
    'G1',
    'trabajador-encargado',
    5,
    [
      { daysAgo: 120, monthsUntil: 3 },
      { daysAgo: 90, monthsUntil: 3 },
      { daysAgo: 60, monthsUntil: 3 },
      { daysAgo: 45, monthsUntil: 3 },
      { daysAgo: 30, monthsUntil: 3 },
    ],
  ),
  createWorker('Ana', 'Martínez', 'V-23456789', 'G1', 'trabajador-general', 3, [
    { daysAgo: 100, monthsUntil: 2 },
    { daysAgo: 20, monthsUntil: 1 },
    { daysAgo: 180, monthsUntil: 3 },
    { daysAgo: 90, monthsUntil: 2 },
    { daysAgo: 15, monthsUntil: 1 },
  ]),
  createWorker(
    'Luis',
    'Rodríguez',
    'V-34567890',
    'G1',
    'trabajador-general',
    2,
    [
      { daysAgo: 200, monthsUntil: -1 },
      { daysAgo: 150, monthsUntil: -2 },
      { daysAgo: 100, monthsUntil: 1 },
      { daysAgo: 80, monthsUntil: 2 },
      { daysAgo: 60, monthsUntil: 3 },
    ],
  ),
  createWorker('Sofia', 'Pérez', 'V-45678901', 'G1', 'trabajador-general', 4, [
    { daysAgo: 25, monthsUntil: 2 },
    { daysAgo: 40, monthsUntil: 3 },
    { daysAgo: 15, monthsUntil: 1 },
    { daysAgo: 35, monthsUntil: 2 },
    { daysAgo: 10, monthsUntil: 1 },
  ]),

  // G2
  createWorker(
    'Carlos',
    'Leal',
    'V-23423633',
    'G2',
    'trabajador-encargado',
    6,
    [
      { daysAgo: 90, monthsUntil: 3 },
      { daysAgo: 70, monthsUntil: 2 },
      { daysAgo: 50, monthsUntil: 1 },
      { daysAgo: 110, monthsUntil: 3 },
      { daysAgo: 30, monthsUntil: 2 },
    ],
  ),
  createWorker('María', 'López', 'V-67890123', 'G2', 'trabajador-general', 2, [
    { daysAgo: 180, monthsUntil: -3 },
    { daysAgo: 160, monthsUntil: -2 },
    { daysAgo: 140, monthsUntil: -1 },
    { daysAgo: 120, monthsUntil: 1 },
    { daysAgo: 100, monthsUntil: 2 },
  ]),
  createWorker('José', 'Sánchez', 'V-78901234', 'G2', 'trabajador-general', 1, [
    { daysAgo: 20, monthsUntil: 2 },
    { daysAgo: 10, monthsUntil: 1 },
    { daysAgo: 35, monthsUntil: 3 },
    { daysAgo: 25, monthsUntil: 2 },
    { daysAgo: 15, monthsUntil: 1 },
  ]),
  createWorker('Laura', 'Torres', 'V-89012345', 'G2', 'trabajador-general', 3, [
    { daysAgo: 130, monthsUntil: -1 },
    { daysAgo: 110, monthsUntil: 1 },
    { daysAgo: 90, monthsUntil: 2 },
    { daysAgo: 70, monthsUntil: 3 },
    { daysAgo: 50, monthsUntil: 2 },
  ]),

  // G3
  createWorker(
    'Pedro',
    'Ramírez',
    'V-90123456',
    'G3',
    'trabajador-encargado',
    7,
    [
      { daysAgo: 80, monthsUntil: 3 },
      { daysAgo: 60, monthsUntil: 2 },
      { daysAgo: 40, monthsUntil: 1 },
      { daysAgo: 100, monthsUntil: 3 },
      { daysAgo: 20, monthsUntil: 2 },
    ],
  ),
  createWorker(
    'Carmen',
    'Flores',
    'V-01234567',
    'G3',
    'trabajador-general',
    2,
    [
      { daysAgo: 200, monthsUntil: -4 },
      { daysAgo: 180, monthsUntil: -3 },
      { daysAgo: 160, monthsUntil: -2 },
      { daysAgo: 140, monthsUntil: -1 },
      { daysAgo: 120, monthsUntil: 1 },
    ],
  ),
  createWorker('Miguel', 'Díaz', 'V-11223344', 'G3', 'trabajador-general', 4, [
    { daysAgo: 30, monthsUntil: 2 },
    { daysAgo: 15, monthsUntil: 1 },
    { daysAgo: 45, monthsUntil: 3 },
    { daysAgo: 20, monthsUntil: 2 },
    { daysAgo: 10, monthsUntil: 1 },
  ]),
  createWorker('Elena', 'Gómez', 'V-22334455', 'G3', 'trabajador-general', 1, [
    { daysAgo: 140, monthsUntil: -2 },
    { daysAgo: 120, monthsUntil: -1 },
    { daysAgo: 100, monthsUntil: 1 },
    { daysAgo: 80, monthsUntil: 2 },
    { daysAgo: 60, monthsUntil: 3 },
  ]),

  // TN
  createWorker(
    'Roberto',
    'Castro',
    'V-33445566',
    'TN',
    'trabajador-encargado',
    8,
    [
      { daysAgo: 70, monthsUntil: 3 },
      { daysAgo: 50, monthsUntil: 2 },
      { daysAgo: 90, monthsUntil: 3 },
      { daysAgo: 30, monthsUntil: 1 },
      { daysAgo: 40, monthsUntil: 2 },
    ],
  ),
  createWorker(
    'Javier',
    'Morales',
    'V-44556677',
    'TN',
    'trabajador-general',
    3,
    [
      { daysAgo: 190, monthsUntil: -3 },
      { daysAgo: 170, monthsUntil: -2 },
      { daysAgo: 150, monthsUntil: -1 },
      { daysAgo: 130, monthsUntil: 2 },
      { daysAgo: 110, monthsUntil: 3 },
    ],
  ),
  createWorker(
    'Andrea',
    'Navarro',
    'V-55667788',
    'TN',
    'trabajador-general',
    2,
    [
      { daysAgo: 25, monthsUntil: 2 },
      { daysAgo: 10, monthsUntil: 1 },
      { daysAgo: 35, monthsUntil: 3 },
      { daysAgo: 15, monthsUntil: 1 },
      { daysAgo: 5, monthsUntil: 1 },
    ],
  ),
  createWorker(
    'Fernando',
    'Herrera',
    'V-66778899',
    'TN',
    'trabajador-general',
    5,
    [
      { daysAgo: 150, monthsUntil: -1 },
      { daysAgo: 130, monthsUntil: 1 },
      { daysAgo: 110, monthsUntil: 2 },
      { daysAgo: 90, monthsUntil: 3 },
      { daysAgo: 70, monthsUntil: 2 },
    ],
  ),
];
