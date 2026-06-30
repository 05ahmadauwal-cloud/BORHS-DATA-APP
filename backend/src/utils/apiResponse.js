class ApiResponse {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }

  static created(res, data = {}, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      ...data,
    });
  }

  static error(res, message = 'An error occurred', statusCode = 400, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({ success: false, message });
  }

  static forbidden(res, message = 'Access denied') {
    return res.status(403).json({ success: false, message });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({ success: false, message });
  }

  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  static serverError(res, message = 'Internal server error') {
    return res.status(500).json({ success: false, message });
  }
}

module.exports = ApiResponse;
