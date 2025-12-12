import type { Request } from "express";

export interface ValidatedRequest<T = any> extends Request {
  validated?: T;
}

export interface AttendanceByIdRequest extends Request {
  validated?: {
    query: {
      session_id: number;
      client_id: number;
    };
  };
}

export interface CreateAttendanceRequest extends Request {
  validated?: {
    body: {
      session_id: number;
      client_id: number;
    };
  };
}

export interface UpdateAttendanceStatusRequest extends Request {
  validated?: {
    body: {
      session_id: number;
      client_id: number;
      status: "booked" | "attended" | "missed" | "cancelled";
    };
  };
}
