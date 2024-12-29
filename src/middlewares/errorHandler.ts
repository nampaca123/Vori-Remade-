import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// Custom Error 클래스 정의
class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: number = 0
  ) {
    super(message);
  }
}

// Error Response 포맷
const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errorCode: number
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message
    }
  });
};

// Error Handler Middleware를 ErrorRequestHandler로 타입 지정
const errorHandlerMiddleware: ErrorRequestHandler = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        code: 0,
        message: `Internal Server Error: ${err.message}`
      }
    });
  }
};

export { CustomError, errorHandlerMiddleware }; 