export type Timestamp = {
  pattern: string
  locale?: null
  utf8?: boolean
}

export enum ColumnType {
  AUTO = "",
  BINARY = "BINARY",
  BOOLEAN = "BOOLEAN",
  BYTE = "BYTE",
  CHAR = "CHAR",
  DATE = "DATE",
  DOUBLE = "DOUBLE",
  FLOAT = "FLOAT",
  GEOHASH = "GEOHASH",
  INT = "INT",
  IPV4 = "IPV4",
  LONG = "LONG",
  LONG256 = "LONG256",
  SHORT = "SHORT",
  STRING = "STRING",
  SYMBOL = "SYMBOL",
  TIMESTAMP = "TIMESTAMP",
  UUID = "UUID",
}

export type RequestColumn = {
  file_column_name: string
  file_column_index: number
  table_column_name: string
  column_type: keyof typeof ColumnType
  formats?: Timestamp[]
}

export type SchemaRequest = {
  columns: RequestColumn[]
  formats: Record<"DATE" | "TIMESTAMP", Timestamp[]>
}
