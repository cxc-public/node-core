const fs = require('fs');
const path = require('path');
const HashMap = require('hashmap').HashMap;

/** 获取敏感词 */
const getSensitiveWords = () => {
  let filePath = path.join(__dirname, '../config/sensitive-keyword.txt');
  let data = fs.readFileSync(filePath, { encoding: 'utf-8' });
  fs.close();
  return data;
};

module.exports = {
  camelCase2UnserScore: str => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  },
  camelCase2Strike: str => {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  },
  /** 过滤 HTML标签 */
  htmlFilter: text => {
    if (typeof text !== 'string') {
      return text;
    }
    return text.replace(/[&<>`"'\/]/g, function(result) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '`': '&#x60;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2f;',
      }[result];
    });
  },
  /** 过滤emoji表情 */
  emojiFilter: text => {
    let ranges = ['\ud83c[\udf00-\udfff]', '\ud83d[\udc00-\ude4f]', '\ud83d[\ude80-\udeff]'];
    return text.replace(new RegExp(ranges.join('|'), 'g'), '');
  },
  /** 敏感词过滤 */
  sensitiveWordsFilter: {
    /** 判断是否有敏感词 */
    hasKeyword: text => {
      if (text == null || text == undefined || text == '') return false;
      let filterMap = new HashMap();
      let filterWordList = [];
      let endTag = '\0'; // 关键词结束符
      let data = getSensitiveWords();
      if (data) {
        filterWordList = data.split('|');
        for (let i = 0; i < filterWordList.length; i++) {
          let charArray = filterWordList[i].split('');
          let len = charArray.length;
          if (len > 0) {
            let subMap = filterMap;
            for (let k = 0; k < len - 1; k++) {
              let obj = subMap.get(charArray[k]);
              if (obj == null) {
                let subMapTmp = new HashMap();
                subMap.set(charArray[k], subMapTmp);
                subMap = subMapTmp;
              } else {
                subMap = obj;
              }
            }
            let obj = subMap.get(charArray[len - 1]);
            if (obj == null) {
              obj = new HashMap();
              obj.set(endTag, null);
              subMap.set(charArray[len - 1], obj);
            } else {
              obj.set(endTag, null);
            }
          }
        }
      }
      let charArray = text.split('');
      let len = charArray.length;
      for (let i = 0; i < len; i++) {
        let index = i;
        let sub = filterMap.get(charArray[index]);
        while (sub != null) {
          if (sub.has(endTag)) {
            return true;
          } else {
            index++;
            if (index >= len) {
              return false;
            }
            sub = sub.get(charArray[index]);
          }
        }
      }
      return false;
    },
    /** 替换敏感词 */
    replaceKeyword: (text, replaceWord) => {
      if (text == null || text == undefined || text == '') return text;
      let filterMap = new HashMap();
      let filterWordList = [];
      let endTag = '\0'; // 关键词结束符
      let data = getSensitiveWords();
      if (data) {
        filterWordList = data.split('|');
        for (let i = 0; i < filterWordList.length; i++) {
          let charArray = filterWordList[i].split('');
          let len = charArray.length;
          if (len > 0) {
            let subMap = filterMap;
            for (let k = 0; k < len - 1; k++) {
              let obj = subMap.get(charArray[k]);
              if (obj == null) {
                let subMapTmp = new HashMap();
                subMap.set(charArray[k], subMapTmp);
                subMap = subMapTmp;
              } else {
                subMap = obj;
              }
            }
            let obj = subMap.get(charArray[len - 1]);
            if (obj == null) {
              obj = new HashMap();
              obj.set(endTag, null);
              subMap.set(charArray[len - 1], obj);
            } else {
              obj.set(endTag, null);
            }
          }
        }
      }
      if (!replaceWord) replaceWord = '*';
      let charArray = text.split('');
      let len = charArray.length;
      let newText = '';
      let i = 0;
      while (i < len) {
        let end = -1;
        let index;
        let sub = filterMap;
        for (let index = i; index < len; index++) {
          sub = sub.get(charArray[index]);
          if (sub == null) {
            if (end == -1) {
              newText += charArray[i];
              i++;
              break;
            } else {
              for (let j = i; j <= end; j++) {
                newText += replaceWord;
              }
              i = end + 1;
              break;
            }
          } else {
            if (sub.has(endTag)) {
              end = index;
            }
          }
        }
        if (index >= len) {
          // 字符串结束
          if (end == -1) {
            // 没匹配到任何关键字
            newText += charArray[i];
            i++;
          } else {
            // 将最长匹配字符串替换为特定字符
            for (let j = i; j <= end; j++) {
              newText += replaceWord;
            }
            i = end + 1;
          }
        }
      }
      return newText;
    },
  },
};
