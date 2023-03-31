import * as cheerio from 'cheerio';
import axios from 'axios';
import express from 'express';
const router = express.Router();




router.get('/', (req, res) => {
  axios.get('https://data.bmkg.go.id/prakiraan-cuaca/')
    .then(response => {
      const $ = cheerio.load(response.data);
      const table = $('table.table-striped').eq(0);
      // const headers = table.find('thead tr th').map((i, el) => $(el).text()).get();
      const rows = table.find('tbody tr').map((i, el) => {
        const row = {};
        row['id'] = i + 1;
        row['Kota'] = $(el).find('td').eq(1).text();
        let link = $(el).find('td').find('a').attr('href');
        row['Link'] = link.replace('..', "https://data.bmkg.go.id/");
        return row;
      }).get();
      res.send(rows);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error');

    });
})

export default router;
