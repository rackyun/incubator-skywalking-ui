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

import React, { PureComponent } from 'react';
import { List } from 'antd';
import DescriptionList from "../../components/DescriptionList";
import styles from "../../components/TraceStack/index.less";

const { Description } = DescriptionList;

export default class TraceLogRecord extends PureComponent {

  render() {
    const {logRecords} = this.props;
    return (
      <List
        itemLayout="horizontal"
        dataSource={logRecords}
        renderItem={log => (
          <List.Item>
            <List.Item.Meta
              size="small"
              title={log.appname}
              description={
                <DescriptionList layout="vertical" col={1}>
                  <Description key="hostname" term={log.hostname}>
                    <pre className={styles.pre}>[{log.time}] {log.message}</pre>
                  </Description>
                </DescriptionList>
              }
            />
          </List.Item>
        )}
      />
    );
  }
}
