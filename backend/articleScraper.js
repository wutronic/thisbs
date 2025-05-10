const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeArticleText(url) {
  try {
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(html);
    // Try to extract main content heuristically
    let text = '';
    // Try <article> tag first
    if ($('article').length) {
      text = $('article').text();
    } else if ($('main').length) {
      text = $('main').text();
    } else {
      // Fallback: get largest <div> by text length
      let maxLen = 0;
      $('div').each((i, el) => {
        const t = $(el).text();
        if (t.length > maxLen) {
          maxLen = t.length;
          text = t;
        }
      });
    }
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    if (!text || text.length < 100) {
      throw new Error('Could not extract article text.');
    }
    return text;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error('we appologize, sources like this block services like ours, unfortunately.');
    }
    throw err;
  }
}

module.exports = { scrapeArticleText }; 