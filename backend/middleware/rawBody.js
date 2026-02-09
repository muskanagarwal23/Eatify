module.exports = (req, res, buf) => {
  if (buf && buf.length) {
    req.rawBody = buf;
  }
};
