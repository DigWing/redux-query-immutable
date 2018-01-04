import { assert } from 'chai';
import * as HTTPMethods from '../../src/constants/http-methods';
import superagentInterface from '../../src/network-interfaces/superagent';

describe('superagent interface', () => {
  it('must return an object with both execute and abort functions, as well as the request instance', () => {
    const networkInterface = superagentInterface('http://localhost', HTTPMethods.GET);
    assert.isFunction(networkInterface.execute);
    assert.isFunction(networkInterface.abort);
    assert(networkInterface.instance);
  });

  it('must return a HEAD request when supplied a HEAD method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.HEAD);
    assert.equal(instance.method, HTTPMethods.HEAD);
  });

  it('must return a DELETE request when supplied a DELETE method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.DELETE);
    assert.equal(instance.method, HTTPMethods.DELETE);
  });

  it('must return a GET request when supplied a GET method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.GET);
    assert.equal(instance.method, HTTPMethods.GET);
  });

  it('must return a PATCH request when supplied a PATCH method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.PATCH);
    assert.equal(instance.method, HTTPMethods.PATCH);
  });

  it('must return a POST request when supplied a POST method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.POST);
    assert.equal(instance.method, HTTPMethods.POST);
  });

  it('must return a PUT request when supplied a PUT method', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.PUT);
    assert.equal(instance.method, HTTPMethods.PUT);
  });

  it('must throw an error when supplied an invalid HTTP method', () => {
    const invalid = () => superagentInterface('http://localhost', 'abc');
    assert.throws(invalid, /Unsupported HTTP method/);
  });

  it('must return a POST request with form data if multipart true', () => {
    const { instance } = superagentInterface('http://localhost', HTTPMethods.POST, {
      body: { files: [{ key: 'file1', value: 'x.jpg' }] },
      multipart: true,
    });
    assert.isTrue(instance._formData !== null);
    assert.equal(instance.method, HTTPMethods.POST);
  });

  it('must throw an error when multipart true and not POST method', () => {
    const invalid = () =>
      superagentInterface('http://localhost', HTTPMethods.GET, {
        body: { test: 'x' },
        multipart: true,
      });
    assert.throws(invalid, /Files can only be uploaded with POST requests./);
  });
});
