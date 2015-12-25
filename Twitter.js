'use strict';

require('dotenv').config();

const Twit = require('twit');

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY
  , consumer_secret: process.env.CONSUMER_SECRET
  , access_token: process.env.ACCESS_TOKEN
  , access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

module.exports = class Twitter {

  constructor() {
    this.count = 100;
    this.stream = null;
  }

  openUserStream() {
    this.stream = T.stream('user');
    this.stream.on('user_event', (eventMsg) => {
      console.log(eventMsg);
      switch(eventMsg.event) {
        case 'follow':
          var params = {user_id: eventMsg.source.id_str, follow: true};
          Twitter.follow(params);
          break;
        case 'unfollow':
          // 反応しない。
          var params = {user_id: eventMsg.source.id_str};
          Twitter.unfollow(params);
          break;
        case 'blocked':
          // Blockしたときは反応する。。eventはなぜかunfollow
          var params = {user_id: eventMsg.source.id_str};
          Twitter.unfollow(params);
          break;
        default:
          break;
      }
    });
  }

  uploadMedia(params) {
    return new Promise((resolve, reject) => {
      // var params = {media_data: opts.media_data};
      T.post('media/upload', params, (err, data, response) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  tweetWithMediaInReply(params) {
    return new Promise((resolve, reject) => {
      // var params = {
      //     status: this.text
      //   , media_ids: [this.mediaIdStr]
      //   , in_reply_to_status_id: this.from_tweet.id_str
      // };
      T.post('statuses/update', params, (err, data, response) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  tweet(params) {
    T.post('statuses/update', params, (err, data, response) => {
      console.log('statuses/update text => ', data.text);
    });
  }

  getHomeTimeline() {
    return new Promise((resolve, reject) => {
      T.get('statuses/home_timeline', {count: this.count}, (err, data, response) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  follow(params) {
    // var params = {user_id: opts.user_id, follow: true};
    T.post('friendships/create', params, (err, data, response) => {
      if(err) {
        console.log(err);
        return;
      }
      console.log(data);
    });
  }

  unfollow(params) {
    // var params = {user_id: opts.user_id};
    T.post('friendships/destroy', params, (err, data, response) => {
      if(err) {
        console.log(err);
        return;
      }
      console.log(data);
    });
  }
}