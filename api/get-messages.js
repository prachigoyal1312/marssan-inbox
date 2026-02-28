module.exports = async function handler(req, res) {
  return res.status(200).json({
    message: "API route working fine"
  });
};
