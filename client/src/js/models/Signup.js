import Api from '../utils/Api';

class Signup {
  constructor(api) {
    this.api = api;
  }

  requestSetupEmail() {
    console.log(this.api);
    console.log('send email');
    return true;
  }
}

export default Signup;
