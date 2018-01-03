import superagent from 'superagent';
import invariant from 'invariant';
import * as httpMethods from '../constants/http-methods';

const createRequest = (url, method) => {
  switch (method) {
    case httpMethods.HEAD:
      return superagent.head(url);
    case httpMethods.GET:
      return superagent.get(url);
    case httpMethods.POST:
      return superagent.post(url);
    case httpMethods.PUT:
      return superagent.put(url);
    case httpMethods.PATCH:
      return superagent.patch(url);
    case httpMethods.DELETE:
      return superagent.delete(url);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};

const superagentNetworkInterface = (
  url,
  method,
  { body, headers, credentials, multipart } = {},
) => {
  const request = createRequest(url, method, body);

  if (headers) {
    request.set(headers);
  }

  if (body && !multipart) {
    request.send(body);
  }

  if (credentials === 'include') {
    request.withCredentials();
  }

  if (body && multipart) {
    invariant(httpMethods.POST === method, 'Files can only be uploaded with POST requests.');
    const { fields, files } = body;

    Array.isArray(fields) && fields.forEach(field => request.field(field.key, field.value));
    Array.isArray(files) && files.forEach(file => request.attach(file.key, file.value));
  }

  const execute = cb => {
    request.end((err, response) => {
      const resStatus = (response && response.status) || 0;
      const resBody = (response && response.body) || undefined;
      const resText = (response && response.text) || undefined;
      const resHeaders = (response && response.header) || undefined;

      cb(err, resStatus, resBody, resText, resHeaders);
    });
  };

  const abort = () => request.abort();

  return {
    abort,
    execute,
    instance: request,
  };
};

export default superagentNetworkInterface;
