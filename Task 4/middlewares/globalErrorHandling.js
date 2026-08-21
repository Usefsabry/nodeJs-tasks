export default (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || undefined;

  console.log(err);

  if (err.name === "ValidationError") {
    status = 400;

    errors = Object.values(err.errors).map((element) => ({
      field: element.path,
      message: element.message,
      worngValue: element.value,
    }));

    message = "User validation failed";
  } else if (err.code === 11000) {
    status = 400;

    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    message = `${field} value (${value}) already exist`;
  }

  return res.status(status).json({
    message: message,
    ...(errors && { errors }),
  });
};