const puppeteer = require('puppeteer')

const url = 'https://movie.douban.com/tag/#/?sort=R&range=6,10&tags='

const sleep = time =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  });

// https://github.com/GoogleChrome/puppeteer/issues/290
(async () => {
  console.log('开始访问目标页面')

  const browser = await puppeteer.launch({
    // 关闭无头模式，方便我们看到这个无头浏览器执行的过程
    headless: false,
    args: ['--no-sandbox'],
    timeout: 20000 // 默认超时为30秒，设置为0则表示不设置超时
  })

  // 打开空白页面
  const page = await browser.newPage()
  // 设置浏览器视窗
  page.setViewport({
    width: 1376,
    height: 768
  })
  await page.goto(url, {
    waitUntil: 'networkidle'
  })

  await sleep(2000)
  await page.waitForSelector('.more')
  for (let i = 0; i < 8; i += 1) {
    await sleep(2000)
    await page.click('.more')
  }

  const result = await page.evaluate(() => {
    /* global window:true */
    const $ = window.$
    const its = $('.list-wp a')
    const links = []
    if (its.length >= 1) {
      its.each((index, item) => {
        const it = $(item)
        const doubanId = it.find('div').data('id')
        const title = it.find('.title').text()
        const rate = Number(it.find('.rate').text())
        const poster = it
          .find('img')
          .attr('src')
          .replace('s_ratio', 'l_ratio')

        links.push({
          doubanId,
          title,
          rate,
          poster
        })
      })
    }

    return links
  })

  browser.close()
  process.send({ result }, () => {
    process.exit()
  })
})()
