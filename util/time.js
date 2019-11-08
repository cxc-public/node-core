const moment = require('moment');

module.exports = {
  /**
   * 返回当前时间 seconds 秒之后（前）的时间
   */
  getDateTimeBySeconds: function(seconds, baseTime) {
    baseTime = baseTime || new Date().getTime();
    return moment(baseTime + seconds * 1000).format('YYYY-MM-DD HH:mm:ss');
  },
  /**
   * 计算某日期到当前时间的年份数（根据生日算年龄）
   */
  calculateYearsByDate: function(date) {
    let today = new Date();
    let birthDate = new Date(date);
    let years = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years;
  },
  /**
   * 获取两个日期之间的所有日期
   */
  getDatesBetweenTwoDate: function(startDate, endDate) {
    let dates = [];

    let currDate = moment(startDate).startOf('day');
    let lastDate = moment(endDate).startOf('day');

    dates.push(startDate);
    while (currDate.add(1, 'days').diff(lastDate) <= 0) {
      let date = moment(currDate.clone().toDate()).format('YYYY-MM-DD');
      dates.push(date);
    }
    return dates;
  },
  /**
   * 获取两个日期之间的所有夜晚（一般订房时使用，因为订房是按夜晚来算的）
   */
  getNightDatesBetweenTwoDate: function(startDate, endDate) {
    let dates = [];

    let currDate = moment(startDate).startOf('day');
    let lastDate = moment(endDate).startOf('day');

    dates.push(startDate);
    while (currDate.add(1, 'days').diff(lastDate) < 0) {
      let date = moment(currDate.clone().toDate()).format('YYYY-MM-DD');
      dates.push(date);
    }
    return dates;
  },
};
