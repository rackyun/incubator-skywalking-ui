/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import moment from 'moment';
import { exec } from '../services/graphql';
import { base } from '../utils/models';
import { generateDuration } from '../utils/time';

const optionsQuery = `
  query ServiceOption($duration: Duration!) {
    serviceId: getAllServices(duration: $duration) {
      key: id
      label: name
    }
  }
`;

const dataQuery = `
  query BasicTraces($condition: TraceQueryCondition) {
    queryBasicTraces(condition: $condition) {
      traces {
        key: segmentId
        endpointNames
        duration
        start
        isError
        traceIds
      }
      total
    }
  }
`;

const spanQuery = `query Spans($traceId: ID!) {
  queryTrace(traceId: $traceId) {
    spans {
      traceId
      segmentId
      spanId
      parentSpanId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      serviceCode
      startTime
      endTime
      endpointName
      type
      peer
      component
      isError
      layer
      tags {
        key
        value
      }
      logs {
        time
        data {
          key
          value
        }
      }
    }
  }
  queryLog(traceId: $traceId) {
    logRecords {
      traceId
      span
      hostname
      appname
      time
      level
      thread
      location
      message
      stack
    }
    total
  }
}`;

export default base({
  namespace: 'trace',
  state: {
    queryBasicTraces: {
      traces: [],
      total: 0,
    },
    queryTrace: {
      spans: [],
    },
    queryLog: {
      logRecords: [],
      total: 0,
    },
    showTimeline: false,
  },
  varState: {
    values: {
      duration: generateDuration({
        from() {
          return moment().subtract(15, 'minutes');
        },
        to() {
          return moment();
        },
      }),
      traceState: 'ALL',
      queryOrder: 'BY_START_TIME',
    },
  },
  optionsQuery,
  defaultOption: {
    serviceId: {
      label: 'All Service',
    },
  },
  dataQuery,
  effects: {
    *fetchSpans({ payload }, { call, put }) {
      const response = yield call(exec, { query: spanQuery, variables: payload.variables });
      yield put({
        type: 'saveSpans',
        payload: response,
        traceId: payload.variables.traceId,
      });
    },
  },
  reducers: {
    saveSpans(state, { payload, traceId }) {
      const { data } = state;
      return {
        ...state,
        data: {
          ...data,
          queryTrace: payload.data.queryTrace,
          queryLog: payload.data.queryLog,
          currentTraceId: traceId,
          showTimeline: true,
        },
      };
    },
    hideTimeline(state) {
      const { data } = state;
      return {
        ...state,
        data: {
          ...data,
          showTimeline: false,
        },
      };
    },
    changeTimezone(state) {
      const { variables } = state;
      const { values } = variables;
      return {
        ...state,
        variables: {
          ...variables,
          values: {
            ...values,
            duration: generateDuration({
              from() {
                return moment().subtract(15, 'minutes');
              },
              to() {
                return moment();
              },
            }),
          },
        },
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, state }) => {
        if (pathname === '/trace' && state) {
          const { traceState = 'ALL', queryOrder = 'BY_START_TIME' } = state;
          dispatch({
            type: 'initVariables',
            payload: {
              values: { ...state.values, traceState, queryOrder },
              labels: state.labels,
            },
          });
        }
      });
    },
  },
});
