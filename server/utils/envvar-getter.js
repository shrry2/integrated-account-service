module.exports = (key, required = true) => {
  if (process.env[key] === undefined && required) {
    throw new Error(`Required environment variable [${key}] is not defined.`);
  }

  return process.env[key] || null;
};
