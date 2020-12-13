'use strict'

var utils = require('./utils')
var normalizeHeaderName = require('./helpers/normalizeHeaderName')

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
}

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value
  }
}

function getDefaultAdapter() {
  var adapter
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr')
  } else if (
    typeof process !== 'undefined' &&
    Object.prototype.toString.call(process) === '[object process]'
  ) {
    // For node use HTTP adapter
    adapter = require('./adapters/http')
  }
  return adapter
}

var defaults = {
  adapter: getDefaultAdapter(),
  // 根据data类型设置请求头，并返回处理过后data
  transformRequest: [
    function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept')
      normalizeHeaderName(headers, 'Content-Type')
      if (
        utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8')
        return data.toString()
      }
      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
        return JSON.stringify(data)
      }
      return data
    }
  ],

  transformResponse: [
    function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          // 自动的parse JSON数据
          data = JSON.parse(data)
        } catch (e) {
          /* Ignore */
        }
      }
      return data
    }
  ],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,
  // 默认的status
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300
  }
}

// 默认基础请求头设置
defaults.headers = {
  common: {
    Accept: 'application/json, text/plain, */*'
  }
}

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {}
})

// 设置这些方法默认的content-type
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE)
})

module.exports = defaults
