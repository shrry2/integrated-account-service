const SigninAPI = {};

SigninAPI.createToken = (api, identifier) => api.post(
  '/signin/_/create_token', {
    identifier,
  },
);

SigninAPI.sendEmail = (api, token) => api.post(
  '/signin/_/email/issue', {
    token,
  },
);

SigninAPI.verifyEmail = (api, token, code) => api.post(
  '/signin/_/email/verify', {
    token,
    code,
  },
);

SigninAPI.issuePhone = (api, token) => api.post(
  '/signin/_/phone/issue', {
    token,
  },
);

SigninAPI.verifyPhone = (api, token, code) => api.post(
  '/signin/_/phone/verify', {
    token,
    code,
  },
);

SigninAPI.requestSession = (api, token, extend) => api.post(
  '/signin/_/let_me_in', {
    token,
    extend,
  },
);

export default SigninAPI;
