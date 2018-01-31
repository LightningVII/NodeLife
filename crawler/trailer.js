const puppeteer = require('puppeteer')

const base = 'https://movie.douban.com/subject/'
// const trailerBase = 'https://movie.douban.com/trailer/';

const sleep = time =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  })

const processCb = async (movies) => {
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

  for (let i = 0; i < movies.length; i += 1) {
    const doubanId = movies[i].doubanId

    await page.goto(base + doubanId, {
      waitUntil: 'networkidle'
    })
    await sleep(1000)

    const result = await page.evaluate(() => {
      /* global window:true */
      const $ = window.$
      const it = $('.related-pic-video')

      if (it && it.length > 0) {
        const link = it.attr('href')
        const cover = it.find('img').attr('src')

        return {
          link,
          cover
        }
      }

      return {}
    })

    let video

    if (result.link) {
      await page.goto(result.link, {
        waitUntil: 'networkidle'
      })
      await sleep(1000)

      video = await page.evaluate(() => {
        const $ = window.$
        const it = $('source')

        if (it && it.length > 0) {
          return it.attr('src')
        }

        return ''
      })
    }

    const data = {
      video,
      doubanId,
      cover: result.cover
    }

    process.send(data)
  }

  browser.close()
  process.exit()
}

process.on('message', processCb)
