const sheet = require('../utils/sheet.js');

module.exports = () => {
  return sheet(1,'1LO6WD9Kffm0jQBzLx1zgDy8E7gQpKHuujNo2LW7F_ig').then((result)=> {
    let data = JSON.parse(result);
    return data;
  })
}
