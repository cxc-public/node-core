const xml2js = require('xml2js');
const xmljs = require('xml-js');

module.exports = {
  buildXML: (obj, rootName = 'xml') => {
    const opt = {
      xmldec: null,
      rootName,
      allowSurrogateChars: true,
      cdata: true,
    };
    return new xml2js.Builder(opt).buildObject(obj);
  },
  xmlToObj: xml => {
    return xmljs.xml2js(xml, { compact: true });
  },
};
