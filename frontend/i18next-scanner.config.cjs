const fs = require('fs');
const path = require('path');

module.exports = {
  input: [
    'src/**/*.{js,jsx}', // Scan all file jsx
    '!**/node_modules/**',
    '!dist/**',
  ],
  output: './src/i18n/',
  options: {
    debug: false,
    removeUnusedKeys: false,
    jsx: true,
    func: {
      list: ['t'], // find (t)
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaultValue',
      fallbackKey: function(ns, value) {
        return value;
      },
    },
    lngs: ['en', 'vi'], // SP language
    defaultLng: 'vi',
    defaultNs: 'translation',
    resource: {
      loadPath: 'src/i18n/{{lng}}.json',
      savePath: '{{lng}}.json',
      jsonIndent: 2,
    },
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: function customTransform(file, enc, done) {
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      parser.set(key, options);
    });
    done();
  },
};
