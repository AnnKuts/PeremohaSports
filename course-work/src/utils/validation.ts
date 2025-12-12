export function parseId(id: string, fieldName = "ID"): number {
  const parsed = Number.parseInt(id);
  if (Number.isNaN(parsed)) {
    throw new TypeError(`Invalid ${fieldName}`);
  }
  return parsed;
}

export function parsePaginationParams(query: any): {
  limit?: number;
  offset?: number;
  includeStats: boolean;
} {
  return {
    limit: query.limit ? Number.parseInt(query.limit as string) : undefined,
    offset: query.offset ? Number.parseInt(query.offset as string) : undefined,
    includeStats: query.include_stats !== "false",
  };
}
