const moment = require('moment-timezone');

const TZParser = (dateString, timezone) => {
  const format = 'YYYY/MM/DD HH:mm:ss';

  if (timezone) {
    return moment.utc(dateString).tz(timezone).format(format);
  }

  return moment.utc(dateString).format(format);
};

export default TZParser;