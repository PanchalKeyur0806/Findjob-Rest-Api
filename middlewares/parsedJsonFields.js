export const parsedJsonFields =
  (fields = []) =>
  (req, res, next) => {
    for (const field of fields) {
      if (req.body[field]) {
        try {
          const parsed = JSON.parse(req.body[field]);
          req.body[field] = parsed;
        } catch (error) {
          console.log("Error ", error);
        }
      }
    }

    next();
  };
