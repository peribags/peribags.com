import "server-only";

export type ServiceErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "DB_ERROR"
  | "UNKNOWN";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: ServiceErrorCode = "UNKNOWN",
    details?: unknown,
  ) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = statusForCode(code);
    this.details = details;
  }
}

function statusForCode(code: ServiceErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION":
      return 400;
    case "CONFLICT":
      return 409;
    case "DB_ERROR":
      return 500;
    default:
      return 500;
  }
}
