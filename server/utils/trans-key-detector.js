/**
 * check if the string seems to be a translation key
 */

module.exports = (string) => {
  const re = /.*[:.].*/;
  return re.test(string);
};
