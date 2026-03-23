/**
 * Sends a standardised JSON success response.
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  res.status(statusCode).json({ success: true, message, data });
};

/**
 * Sends a standardised paginated response.
 */
const sendPaginated = (res, data, page, limit, total) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { sendSuccess, sendPaginated };
