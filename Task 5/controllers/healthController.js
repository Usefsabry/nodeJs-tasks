// Simple Health Check Controller
const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
