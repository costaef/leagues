export abstract class HttpClientError extends Error {
  readonly statusCode!: number;
  readonly name!: string;

  constructor(message: object | string) {
    if (message instanceof Object) {
      super(JSON.stringify(message));
    } else {
      super(message);
    }

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HTTP400Error extends HttpClientError {
  readonly statusCode = 400;

  constructor(message: string | object = 'Bad Request') {
    super(message);
  }
}

export class HTTP404Error extends HttpClientError {
  readonly statusCode = 404;

  constructor(message: string | object = 'Not Found') {
    super(message);
  }
}

export class HTTP422Error extends HttpClientError {
  readonly statusCode = 422;

  constructor(message: string | object = 'Unprocessable Entity') {
    super(message);
  }
}
