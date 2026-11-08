export interface EPPDates {
  lastRenewal: string
  nextRenewal: string
  notOwned?: boolean
}

export interface EPPs {
  casco: EPPDates
  lentes: EPPDates
  botas: EPPDates
  auditivo: EPPDates
  fullFace: EPPDates
}
