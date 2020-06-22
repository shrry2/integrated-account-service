import axios from 'axios';
import uuidv4 from 'uuid/v4';

class ApiClient {
  constructor() {
    const csrfMetaDOM = document.querySelector('meta[name="csrf-token"]');
    this.csrfToken = csrfMetaDOM.getAttribute('content');

    this.currentRequest = null;
  }

  createRequest(config = {}) {
    // init request
    this.currentRequest = null;

    // create new request ID
    const requestId = uuidv4();

    // create header
    const headers = {
      'x-request-id': requestId,
      'x-csrf-token': this.csrfToken,
    };

    const options = { ...config, headers };
    if (config.headers) {
      options.headers = { ...options.headers, ...config.headers };
    }

    // create request instance
    this.currentRequest = axios.create(options);
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

  async put(url, data) {
    const request = this.createRequest();
    try {
      const response = await request.put(url, data);
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }

  async delete(url) {
    const request = this.createRequest();
    try {
      const response = await request.delete(url);
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }

  async uploadImage(url, image, fieldName = 'image') {
    const request = this.createRequest();
    const form = new FormData();
    form.append(fieldName, image);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    try {
      const response = await request.post(url, form, config);
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }

  async uploadImageWithCropData(url, image, cropData) {
    const request = this.createRequest();
    const form = new FormData();
    form.append('image', image);
    form.append('cropData', JSON.stringify(cropData));
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    try {
      const response = await request.post(url, form, config);
      return response.data;
    } catch (error) {
      throw this.generateError(error);
    }
  }
}

export default ApiClient;
