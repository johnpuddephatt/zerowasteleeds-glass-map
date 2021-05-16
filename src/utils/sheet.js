const axios  = require('axios');
const seed   = require('./save-seed.js');
const fs = require("fs");
let cachePath = `${__dirname}/../cache/sheet.json`;
var slugify = require('slugify');

// Once a googel sheet is "published to the web" we can access its JSON
// via a URL of this form. We just need to pass in the ID of the sheet
// which we can find in the URL of the document.

module.exports = (sheetID, documentID) => {
  let cachePath = `${__dirname}/../data/cache/${documentID}_${sheetID}.json`;

  return new Promise((resolve, reject) => {


    if (fs.existsSync(cachePath) && (process.env.ELEVENTY_ENV == 'development')) {
      console.log(`Hitting cache: ${ cachePath }`);
      resolve(fs.readFileSync(cachePath, 'utf8'));
    }

    else {
      console.log(`Fetching data from https://spreadsheets.google.com/feeds/list/${documentID}/${sheetID}/public/values?alt=json`);

      axios.get(`https://spreadsheets.google.com/feeds/list/${documentID}/${sheetID}/public/values?alt=json`)
        .then(response => {

          // massage the data from the Google Sheets API into
          // a shape that will more convenient for us in our SSG.
          var data = [];

          response.data.feed.entry.forEach(item => {
            if(item.gsx$sitename.$t.trim() && item.gsx$latitude.$t.trim() && !item.gsx$dateclosed.$t) {
              let row = {
                "id": item.gsx$uprn?.$t + item.gsx$sitenumber?.$t + item.gsx$sitename?.$t.replace(' ', '-').toLowerCase(),
                "name": item.gsx$sitename?.$t,
                "category": item.gsx$locationtype?.$t,
                "latitude": item.gsx$latitude?.$t,
                "longitude": item.gsx$longitude?.$t,
                "address": item.gsx$address?.$t,
                "postcode": item.gsx$postcode?.$t,
                "weight": item.gsx$_arr0q?.$t
              };
              data.push(row);
            }
          });

          // stash the data locally for developing without
          // needing to hit the API each time.
          seed(JSON.stringify(data), cachePath);

          // resolve the promise and return the data
          resolve(JSON.stringify(data));

        })

        // uh-oh. Handle any errrors we might encounter
        .catch(error => {
          console.log('Error :', error);
          reject(error);
        });
      }
  })

}
