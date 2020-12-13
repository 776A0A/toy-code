'use strict'

var utils = require('./../utils')
var buildURL = require('../helpers/buildURL')
var InterceptorManager = require('./InterceptorManager')
var dispatchRequest = require('./dispatchRequest')
var mergeConfig = require('./mergeConfig')

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {}
    config.url = arguments[0]
  } else {
    config = config || {}
  }

  config = mergeConfig(this.defaults, config)

  // Set config.method
  // 都会转换为小写
  if (config.method) {
    config.method = config.method.toLowerCase()
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase()
  } else {
    config.method = 'get'
  }

  // Hook up interceptors middleware
  // 默认的chain中包含了dispatchRequest，但是没有包含errorRequestHandler
  var chain = [dispatchRequest, undefined]
  var promise = Promise.resolve(config) // 开始一个promise并传入config

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    // 先加入的requestInterceptor最后触发，最后加入的最先触发
    chain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected)
  })

  // 使用then来将处理流程链接起来，所以如果想中断这个过程就要抛出reject并且最后在最后加上一个错误处理
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift()) // 因为interceptor都是两两传入的所以这里这样写没问题
  }

  return promise
}

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config)
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '')
}

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, config) {
    return this.request(
      mergeConfig(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data // 要么是data要么是undefined
      })
    )
  }
})

// post等可以通过第二个参数传参，而get等如果想传params就只能自己拼接
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(
      mergeConfig(config || {}, {
        method: method,
        url: url,
        data: data
      })
    )
  }
})

module.exports = Axios
