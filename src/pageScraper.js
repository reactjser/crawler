const fs = require('fs-extra');
const { BASE_URL } = require('./config');

const scraperObject = {
  url: BASE_URL,
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    page.setViewport({
      width: 1200,
      height: 800
    });
    await page.goto(this.url);

    await page.waitForSelector('.footer-shop');

    const totalData = await page.$$eval(
      '#oldgoods .prefectgoods-container',
      (sections) => {
        const data = [];
        Array.from(sections).forEach((section, index) => {
          const category = section.querySelector(
            '.index-goodslist-subtitlewap'
          ).textContent;
          const subCategories = [...section.querySelectorAll('.index-goodslist-subtag a')].map(item => item.textContent);

          const listDom = section.querySelectorAll('.index-float-two');
          const list = Array.from(listDom).map((item) => {
            if (item.querySelector('img')) {
              const id = item.querySelector('a').getAttribute('itemid');
              const link = item.querySelector('a').href;
              const imgSrc = item.querySelector('img').dataset.original;
              const name = item.querySelector('.box-sub-name').textContent;
              const newPrice = item.querySelectorAll('.es-font')[0].textContent.replace('¥', '');
              const oldPrice = item.querySelectorAll('.es-font')[1].textContent.replace('¥', '');
              const tags = [...item.querySelectorAll('.box-sub-tag')].map(item => item.textContent);

              return {
                id,
                name,
                link,
                imgSrc,
                newPrice,
                oldPrice,
                tags
              };
            }
            return null;
          }).filter(Boolean);

          data.push({
            category,
            subCategories,
            list
          });
        });
        return data;
      }
    );

    // console.log(JSON.stringify(totalData, null, 2));

    try {
      await fs.writeJson('./data.json', totalData, {
        spaces: 2
      });
      console.log('Save susscessed!');
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = scraperObject;
