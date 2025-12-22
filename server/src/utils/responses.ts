export function successResponse<T>(data: T, options?: { total?: number; message?: string }) {
  const response: any = { success: true, data };

  if (options?.total !== undefined) {
    response.total = options.total;
  }

  if (options?.message) {
    response.message = options.message;
  }

  return response;
}

export function errorResponse(message: string, statusCode?: number) {
  const response: any = { error: message };

  if (statusCode !== undefined) {
    response.statusCode = statusCode;
  }

  return response;
}
