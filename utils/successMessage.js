export const successMessage = (
  res,
  statusCode = 200,
  status = "success",
  message = null,
  data = null,
  token = null
) => {
  const responseObj = {
    status,
    message,
    ...(data !== null && { data }),
    ...(token !== null && { token }),
  };
  return res.status(statusCode).json(responseObj);
};
