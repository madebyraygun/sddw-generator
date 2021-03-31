const sass = require('node-sass');

module.exports = function (data, file) {
  try {
    return sass.renderSync({ data, file }).css.toString('utf8');
  } catch (e) {
    console.error(e);
  }
};