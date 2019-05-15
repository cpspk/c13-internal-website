import axios from 'axios'
import get from 'lodash/get'
import pick from 'lodash/pick'
import { call, put } from 'redux-saga/effects'

import { requestRejected, requestPending, requestSuccess } from './actions'

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json'
})

export default ({
  type,
  method, // one of 'get', 'post', 'put', 'delete'
  path,
  allowedParamKeys,
  defaultParams,
  headers,
  stealthy,
  success, // Can be function generator to use yield
  fail, // Can be function generator to use yield
  payloadOnSuccess,
  payloadOnFail,
  requestSelectorKey,
  selectorKey
}) =>
  function*(action) {
    const payload = action.payload || {}
    const {
      data,
      params,
      headers: customHeaders,
      success: successCallback,
      fail: failCallback,
      onUploadProgress,
      onDownloadProgress,
      resolve,
      reject
    } = payload

    try {
      if (!stealthy) {
        yield put(requestPending({ selectorKey, requestSelectorKey, method }))
      }

      const queryParams = { ...defaultParams, ...params }

      const res = yield call(axios.request, {
        url: typeof path === 'function' ? path(action) : path,
        method: method.toLowerCase(),
        headers: {
          ...defaultHeaders(),
          ...headers,
          ...(customHeaders ? customHeaders : {})
        },
        data,
        params: allowedParamKeys ? pick(queryParams, allowedParamKeys) : queryParams,
        baseURL: process.env.REACT_APP_API_HOST,
        onUploadProgress,
        onDownloadProgress
      })

      const payload = payloadOnSuccess ? payloadOnSuccess(res.data, action) : res.data
      yield put(
        requestSuccess({
          selectorKey,
          requestSelectorKey,
          method,
          data: payload
        })
      )

      if (resolve) {
        // Promise parameter
        yield resolve(payload)
      }

      if (success) {
        yield success(payload, action)
      }
      successCallback && successCallback(payload)

      return true
    } catch (err) {
      console.error(err)
      const errRes = get(err, 'response', err)
      const payload = payloadOnFail ? payloadOnFail(errRes, action) : errRes
      if (!stealthy) {
        yield put(
          requestRejected({
            selectorKey,
            requestSelectorKey,
            method,
            data: payload
          })
        )
      }

      if (reject) {
        // Promise parameter
        yield reject(payload)
      }

      if (fail) {
        yield fail(errRes)
      }

      failCallback && failCallback(errRes)

      return false
    }
  }