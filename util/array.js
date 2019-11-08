module.exports = {
  /**
   * 返回组合的数组
   * 比如传入 [ [ '黑色', '红色', '蓝色' ], [ '第一代', '第二代' ], [ '男款' ] ]
   * 返回
    [ [ '黑色', '第一代', '男款' ],
    [ '黑色', '第二代', '男款' ],
    [ '红色', '第一代', '男款' ],
    [ '红色', '第二代', '男款' ],
    [ '蓝色', '第一代', '男款' ],
    [ '蓝色', '第二代', '男款' ] ]
   * @param {Array} arr
   */
  combination: function(arr) {
    let that = this;
    let len = arr.length;

    if (!arr.length) {
      return arr;
    }

    // 当数组大于等于 2 个的时候
    if (len >= 2) {
      // 第一个数组的长度
      let len1 = arr[0].length;
      // 第二个数组的长度
      let len2 = arr[1].length;
      // 2 个数组产生的组合数
      let lenBoth = len1 * len2;
      //  申明一个新数组
      let items = new Array(lenBoth);
      // 申明新数组的索引
      let index = 0;
      for (let i = 0; i < len1; i++) {
        for (let j = 0; j < len2; j++) {
          if (arr[0][i] instanceof Array) {
            items[index] = arr[0][i].concat(arr[1][j]);
          } else {
            items[index] = [arr[0][i]].concat(arr[1][j]);
          }
          index++;
        }
      }
      let newArr = new Array(len - 1);
      for (let i = 2; i < arr.length; i++) {
        newArr[i - 1] = arr[i];
      }
      newArr[0] = items;
      return that.combination(newArr);
    } else {
      return arr[0];
    }
  },
};
