export interface DataEntry {
  messageID: string
  incidentID: string
  lastUpdate: string
  resolved: boolean
}

export interface DataEntryResult {
  result: string | null
}
