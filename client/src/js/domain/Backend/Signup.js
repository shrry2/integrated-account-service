const SignupAPI = {};

SignupAPI.createSignup = (api, displayName, contact, withEmail) => api.post(
  '/signup/_/create_signup', {
    displayName,
    contact,
    contactType: withEmail ? 'email' : 'mobilePhone',
  },
);

SignupAPI.verifyEmail = (api, signupId, verificationKey) => api.post(
  '/signup/_/verify_email', {
    signupId,
    verificationKey,
  },
);

SignupAPI.verifyCode = (api, signupId, code) => api.post(
  '/signup/_/verify_code', {
    signupId,
    verificationCode: code,
  },
);

SignupAPI.continueSession = (api, extend) => api.post(
  '/signup/_/continue_session', {
    extend,
  },
);

export default SignupAPI;
