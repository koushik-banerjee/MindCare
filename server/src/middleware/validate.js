export const validate =
  ({ body, params, query }) =>
  (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body)
      }
      if (params) {
        req.params = params.parse(req.params)
      }
      if (query) {
        req.query = query.parse(req.query)
      }
      next()
    } catch (error) {
      const issues =
        error?.issues?.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })) || []

      res.status(400).json({
        error: 'Invalid request payload',
        details: issues,
      })
    }
  }
