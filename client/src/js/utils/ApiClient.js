import axios from 'axios';
import uuidv4 from 'uuid/v4';

class ApiClient {
  constructor() {
    const csrfMetaDOM = document.querySelector('meta[name="csrf-token"]');
    if (csrfMetaDOM) {
      this.csrfToken = csrfMetaDOM.getAttribute('content');
    }
    this.currentRequest = null;
  }

  createRequest() {
    // create new request ID
    const requestId = uuidv4();

    // create header
    const headers = {};
    headers['x-request-id'] = requestId;
    if (this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
    }

    // create request instance
    this.currentRequest = axios.create({ headers });
    this.currentRequest.requestId = requestId;

    return this.currentRequest;
  }

  generateError(error) {
    // TODO: Log it!
    console.log(`Error handler called for request ID: ${this.currentRequest.requestId}`);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);

      if (error.response.status < 500) {
        // user input error
        return new Error(error.response.data.error.message);
      }

      // server side error
      // TODO report and show error modal

      if (error.response.data.error.message) {
        return new Error(error.response.data.error.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js

      console.log(error.request);

      alert('client network error');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);

      alert('api request setup error');
    }

    return new Error('Unknown API Error');
  }

  async get(url, params) {
    const request = this.createRequest();
    try {
      const response = await request.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }

  async post(url, data) {
    const request = this.createRequest();
    try {
      const response = await request.post(url, data);
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }
}

export default ApiClient;
