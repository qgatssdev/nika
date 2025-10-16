import {
  BadRequestException,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';

const handleDbErrors = (err) => {
  //foreign key voiation error
  if (err.number === 547) {
    // Handle foreign key violation error here
    throw new BadRequestException('Invalid Foreign Key');
  }
  //duplicate value
  else if (err.number === 2627 || err.number === 2601) {
    throw new BadRequestException('DB duplicate error value already exists');
  }
};

export const handleErrorCatch = (err) => {
  console.log(err);
  const logger = new Logger();
  logger.error(err);
  handleDbErrors(err);

  if (
    err.status === HttpStatus.NOT_FOUND ||
    err.status === HttpStatus.BAD_REQUEST ||
    err.status === HttpStatus.UNAUTHORIZED ||
    err.status === HttpStatus.FORBIDDEN ||
    err.status === HttpStatus.CONFLICT
  ) {
    throw new HttpException(
      {
        status: err.status,
        message:
          err.response.message ||
          err.response.data.message ||
          err.response.error,
        error: err.response.error,
      },
      err.status,
    );
  }

  const message = err.message;

  throw new HttpException(
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: `An error occured with the message: ${err.message}`,
      message: message,
      errorType: 'Internal server error',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
