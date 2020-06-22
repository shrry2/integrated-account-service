import api from '../../utils/api';

const baseURL = '/_/client/dashboard/settings/';

export const updateLocale = (locale) => api.put(`${baseURL}locale`, {
  locale,
});

export const fetchTimezoneList = () => api.get(`${baseURL}timezone/list`);

export const updateTimezone = (timezone) => api.put(`${baseURL}timezone`, {
  timezone,
});

export default {
  updateLocale,
  fetchTimezoneList,
  updateTimezone,
};
