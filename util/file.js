const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const moment = require('moment');
const base64Img = require('base64-img');
const fileType = require('file-type');
const mkdir = require('mkdirp-sync');
const number = require('./number');

module.exports = {
  writeFile: function(_path, filename, content, isAppend) {
    mkdir(_path);
    fs.writeFileSync(path.join(_path, filename), content);
  },
  appendFile: function(_path, filename, content, isAppend) {
    mkdir(_path);
    fs.appendFileSync(path.join(_path, filename), content);
  },
  upload: async function({
    file,
    base64Content,
    repoAbsPath,
    uploadRelativePath,
    fileHost,
    maxFileSize,
    maxImageFileSize,
  }) {
    let _filePath;
    let _fileName = new Date().getTime();
    if (file) {
      _filePath = file.path;
      _fileName = file.name;
    }
    if (base64Content) {
      let tempPath = path.join(repoAbsPath, 'temp');
      let tempFileName = md5(number.generateRandomNumber(_fileName)).substr(0, 16);
      _filePath = base64Img.imgSync(base64Content, tempPath, tempFileName);
    }
    if (!_filePath) {
      throw new Error(`获取上传文件路径时出现异常`);
    }

    let fileBuffer = fs.readFileSync(_filePath);
    let fileTypeInfo = fileType(fileBuffer);
    let fileSize = fileBuffer.byteLength;
    if (!fileTypeInfo.ext) {
      throw new Error(`未知文件类型`);
    }
    maxFileSize = maxFileSize || 20 * 1024 * 1024; // mac 下文件大小计算方式应该是 20 * 1000 * 1000，这里以 windows 机器为准即可
    if (fileSize > maxFileSize) {
      throw new Error(`文件大小不能大于 ${maxFileSize / (1024 * 1024)}M`);
    }
    maxImageFileSize = maxImageFileSize || 2 * 1024 * 1024;
    if (fileSize > maxImageFileSize && fileTypeInfo.mime.indexOf('image/') !== -1) {
      throw new Error(`图片文件大小不能大于 ${maxImageFileSize / (1024 * 1024)}M`);
    }
    const formattedFileName = md5(number.generateRandomNumber(_fileName)).substr(0, 16) + '.' + fileTypeInfo.ext;
    const reader = fs.createReadStream(_filePath);
    const dir = path.join(repoAbsPath, uploadRelativePath, moment().format('YYYY-MM-DD'));

    mkdir(dir);

    const fileStream = fs.createWriteStream(path.join(dir, formattedFileName));
    reader.pipe(fileStream);

    const writeFile = new Promise(function(resolve, reject) {
      reader.on('end', resolve);
      reader.on('error', reject);
    });

    let url, filePath;

    await writeFile
      .then(function() {
        filePath = path.join(dir, formattedFileName);
        url = '//' + path.join(fileHost, filePath.split(repoAbsPath)[1]);
      })
      .catch(function(err) {
        throw new Error(err);
      });

    return {
      url,
      filePath,
    };
  },
};
