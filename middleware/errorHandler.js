export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const STATUS_NAMES = {
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error',
};

export function notFound(req, res, next) {
  const isApi = req.originalUrl.startsWith('/api');
  next(
    new HttpError(
      404,
      isApi
        ? `Route ${req.method} ${req.originalUrl.split('?')[0]} not found.`
        : 'The page you are looking for does not exist.'
    )
  );
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = Number(err.status) || 500;
  const safeMessage =
    status === 500 && !(err instanceof HttpError)
      ? 'Something went wrong on the server.'
      : err.message;

  if (status === 500) console.error(err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({
      status,
      error: STATUS_NAMES[status] || 'Error',
      message: safeMessage,
    });
  }

  res.status(status).render('pages/error', {
    title: `${status} ${STATUS_NAMES[status] || 'Error'}`,
    active: '',
    pageCss: undefined,
    status,
    message: safeMessage,
  });
}