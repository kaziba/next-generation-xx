'use strict';

require('dotenv').config();

const _        = require('lodash');
const kuromoji = require("kuromoji");
const Twitter  = require('./Twitter');

const DIC_DIR        = './node_modules/kuromoji/dist/dict/';
const TWEET_INTERVAL = 1 * 1000 * 60; // 1m


const tokenize = (text) => {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: DIC_DIR }).build((error, tokenizer) => {
      if(error) {
        reject(err);
        return;
      }

      // 形態素解析
      const tweetTokened = tokenizer.tokenize(text);
      console.log('tweetTokened => ', tweetTokened);

      // 名詞だけ取り出す。
      const matches = {pos: '名詞', pos_detail_1: '固有名詞'};
      const nouns = _.pluck(_.filter(tweetTokened, matches), 'surface_form');
      resolve(nouns);
    });
  });
};

const normalizeTweets = (tweets) => {
  return _.chain(tweets)
    .pluck('text')
    .reject( tweetOnlyText => (tweetOnlyText.indexOf('RT') !== -1))
    .map( tweetRejectedRT => tweetRejectedRT.replace(/(http|https).*\s?/g,'').replace(/\s+/g, ""))
    .sample()
    .value();
}

const run = () => {
  console.log('===============> Run');
  const twitter = new Twitter();
  twitter.getHomeTimeline()
  .then( tweets =>  normalizeTweets(tweets))
  .then( tweetNormalized => tokenize(tweetNormalized))
  .then( nouns => {
    console.log('nouns => ', nouns);
    if(_.isEmpty(nouns)) return;
    const params = {
      status: `次世代の${_.sample(nouns)}`
    };
    twitter.tweet(params);
  });
};


(() => {
  const twitter = new Twitter();
  twitter.openUserStream();
  setInterval(run, TWEET_INTERVAL);
})();
