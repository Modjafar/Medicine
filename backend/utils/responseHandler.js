/**
 * Response Handler - Consistent API response formatting
 * 
 * Works seamlessly with custom error classes (AppError, ValidationError, etc.)
 * 
 * Usage:
 * res.status(200).json(responseHandler.success(medicines, 'Medicines retrieved'));
 * res.status(201).json(responseHandler.created(medicine, 'Medicine added'));
 * res.status(200).json(responseHandler.paginate(medicines, page, limit, total));
 */

const responseHandler = {
    /**
     * Standard success response
     */
    success: (data, message = 'Success') => ({
        success: true,
        message,
        data
    }),

    /**
     * Error response (typically used in middleware)
     */
    error: (code, message, status = 400) => ({
        success: false,
        error: {
            code,
            message,
            statusCode: status
        }
    }),

    /**
     * Paginated response for list endpoints
     */
    paginate: (data, page = 1, limit = 10, total = 0, message = 'Data retrieved successfully') => ({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        }
    }),

    /**
     * Created response (201) for new resources
     */
    created: (data, message = 'Resource created successfully') => ({
        success: true,
        message,
        data
    }),

    /**
     * No content / deleted response
     */
    deleted: (message = 'Resource deleted successfully') => ({
        success: true,
        message
    })
};

module.exports = responseHandler;
