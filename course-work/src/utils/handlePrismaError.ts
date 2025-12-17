import AppError from "./AppError";

export function handlePrismaError(err: any) {
  if (err?.code === 'P2002') {
    let field = 'Record';
    if (err?.meta?.target && Array.isArray(err.meta.target)) {
      field = err.meta.target.join(', ');
    } else if (typeof err?.meta?.target === 'string') {
      field = err.meta.target;
    }
    return new AppError(`${field} already exists`, 409);
  }
  return err;
}
