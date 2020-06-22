import api from '../../utils/api';

const baseURL = '/_/client/dashboard/session/';

export const getStates = () => api.get(`${baseURL}states`);

export const switchAccount = (accountId) => api.post(`${baseURL}switch_account`, {
  accountId,
});

export const signout = (from) => api.post(`${baseURL}signout`, {
  from,
});

export default {
  getStates,
  switchAccount,
  signout,
};
