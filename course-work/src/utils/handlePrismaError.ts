import AppError from "./AppError";

export function handlePrismaError(err: any) {
  if (err?.code === 'P2002') {
    return new AppError("Attendance already exists", 409);
  }
  return err;
}
