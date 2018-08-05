import React, { Component } from 'react';
import { Row, Col } from 'antd';
import Loading from '@/components/Loading';
import {
  getNewUserThisWeek, getNewUserLastWeek, getUserTotal,
  getNewTopicThisWeek, getNewTopicLastWeek, getTopicTotal
} from '@/service/api';
import CountCard from './components/CountCard';

export default class Dashboard extends Component {
  state = {
    loading: true,
    statisData: []
  };

  componentDidMount() {
    this.statisData();
  }

  // 获取统计数据
  statisData = async () => {
    const newUserThisWeek = await getNewUserThisWeek();
    const newUserLastWeek = await getNewUserLastWeek();
    const userTotal = await getUserTotal();
    const userRate = newUserLastWeek === 0 ? '-' : (newUserThisWeek - newUserLastWeek) / newUserLastWeek * 100 + '%';
    const newTopicThisWeek = await getNewTopicThisWeek();
    const newTopicLastWeek = await getNewTopicLastWeek();
    const topicTotal = await getTopicTotal();
    const topicRate = newTopicLastWeek === 0 ? '-' : (newTopicThisWeek - newTopicLastWeek) / newTopicLastWeek * 100 + '%';

    console.log();

    const statisData = [
      {
        title: '本周新增用户量',
        icon: 'user',
        color: '#52c41a',
        count: newUserThisWeek,
        last_count: newUserLastWeek,
        rate:  userRate,
        total: userTotal
      },
      {
        title: '本周新增话题量',
        icon: 'profile',
        color: '#fa8c16',
        count: newTopicThisWeek,
        last_count: newTopicLastWeek,
        rate: topicRate,
        total: topicTotal
      }
    ];

    this.setState({
      loading: false,
      statisData
    });
  }

  render() {
    const { loading, statisData } = this.state;

    const statis = statisData.map((item, i) => (
      <Col key={i} xs={24} sm={12} md={12} lg={12} xl={6} style={{ marginBottom: 24 }}>
        <CountCard
          {...item}
        />
      </Col>
    ));

    return (
      <Loading loading={loading}>
        <Row gutter={24}>{statis}</Row>
      </Loading>
    );
  }
}