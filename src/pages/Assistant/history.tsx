import {listMyChartByPageUsingPOST} from '@/services/api-backend/chartController';
import {DashboardOutlined, EllipsisOutlined, FrownOutlined} from '@ant-design/icons/lib';
import ProList from '@ant-design/pro-list';
import {Result, Space, Tag} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, {ReactText, useState} from 'react';
import {listMyAssistantByPageUsingPOST} from "@/services/api-backend/assistantController";
import {LikeOutlined, MessageOutlined, StarOutlined} from "@ant-design/icons";
import {getDictByIdUsingGET} from "@/services/api-backend/dictController";

const IconText = ({icon, text}: { icon: any; text: string }) => (
  <span>
    {React.createElement(icon, {style: {marginInlineEnd: 8}})}
    {text}
  </span>
);

const HistoryAssistant: React.FC = () => {
  const [data, setData] = useState<API.Assistant>();
  const [total, setTotal] = useState<number>(0);
  const [labelMap, setLabelMap] = useState<Map<number, string>>(new Map());

  const initParams: API.AssistantQueryRequest = {
    current: 1,
    pageSize: 5,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const initData = async (params: API.AssistantQueryRequest = initParams) => {
    const res = await listMyAssistantByPageUsingPOST(params);
    if (res.code === 0) {
      setData(res?.data?.records);
      setTotal(res?.data?.total);
    }
  };

  const getDictLabel = async (params: API.getDictByIdUsingGETParams) => {
    const res = await getDictByIdUsingGET(params)
    if (res.code === 0) {
      const oldMap = labelMap
      oldMap.set(params?.id, res?.data.dictLabel)
      setLabelMap(oldMap)
    }
  }

  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly ReactText[]>(
    [],
  );

  return (
    <ProList<API.Assistant>
      search={{}}
      pagination={{
        defaultPageSize: 5,
        showSizeChanger: true,
        total: total,
        defaultCurrent: 1,
        // onShowSizeChange(current: number, size: number) {
        //   setPageNo(1);
        //   setPageSize(size);
        //   console.log(pageNo, pageSize);
        // },
      }}
      request={async (params) => {
        await initData({
          ...params,
        });
      }}
      grid={{gutter: 16, column: 1}}
      itemLayout={'vertical'}
      rowKey="id"
      headerTitle="我的问答"
      dataSource={data}
      metas={{
        title: {
          dataIndex: 'goal',
          title: '问题概述',
          search: false,
        },
        name: {
          dataIndex: 'name',
          title: '问题名称',
        },
        status: {
          dataIndex: 'status',
          title: '状态',
          /*wait,running,succeed,failed*/
          valueEnum: {
            succeed: {
              text: '成功',
              status: 'success',
            },
            running: {
              text: '生成中',
              status: 'processing',
            },
            wait: {
              text: '排队中',
              status: 'default',
            },
            failed: {
              text: '失败',
              status: 'error',
            },
          },
        },
        subTitle: {
          render: (dom, entity) => (
            <>
              {/*{getDictLabel({id: entity?.dictId})}*/}
              <Space size={0}>
                  <Tag color="blue" key={entity?.name}>
                    {entity?.name}
                  </Tag>
              </Space>
            </>
          ),
          search: false,
        },
        actions: {
          render: () => [
            <IconText
              icon={StarOutlined}
              text="156"
              key="list-vertical-star-o"
            />,
            <IconText
              icon={LikeOutlined}
              text="156"
              key="list-vertical-like-o"
            />,
            <IconText
              icon={MessageOutlined}
              text="2"
              key="list-vertical-message"
            />,
          ],
        },
        content: {
          render: (dom, entity) => {
            return (
              <div style={{}}>
                {entity.status === 'succeed' && (
                  <div style={{whiteSpace: 'pre-wrap'}}>
                    {entity?.questionRes}
                  </div>
                )}
                {entity.status === 'wait' && (
                  <>
                    <Result
                      icon={<EllipsisOutlined/>}
                      title="待生成"
                      subTitle={entity.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                )}
                {entity.status === 'running' && (
                  <>
                    <Result
                      icon={<DashboardOutlined/>}
                      title="图表生成中"
                      subTitle={entity.execMessage}
                    />
                  </>
                )}
                {entity.status === 'failed' && (
                  <>
                    <Result
                      icon={<FrownOutlined/>}
                      title="图表生成失败"
                      subTitle={entity.execMessage}
                    />
                  </>
                )}
              </div>
            );
          },
          search: false,
        },
      }}
    />
  );
};
export default HistoryAssistant;
