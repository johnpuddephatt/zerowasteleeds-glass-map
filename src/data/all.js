const sheet = require('../utils/sheet.js');

module.exports = () => {
  return sheet('Sites%20ranked','1LO6WD9Kffm0jQBzLx1zgDy8E7gQpKHuujNo2LW7F_ig',
      ['site_name','location_type','latitude','longitude','address','post_code','2020']
  ).then((result)=> {
    let data = JSON.parse(result);
    return data;
  })
}
