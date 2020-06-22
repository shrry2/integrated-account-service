import api from '../../utils/api';

const baseURL = '/_/client/dashboard/contact/';

export const fetchEmails = () => api.get(`${baseURL}email/list`);

export const fetchPhones = () => api.get(`${baseURL}phone/list`);

export default {
  fetchEmails,
  fetchPhones,
};
