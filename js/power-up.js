/* global TrelloPowerUp */

var BASE_URL = 'https://hongrois123.github.io/equity-research-power-up';

TrelloPowerUp.initialize({
  'card-buttons': function (t) {
    return [{
      icon: BASE_URL + '/img/icon.svg',
      text: 'Equity Research',
      callback: function (t) {
        return t.popup({
          title: 'Equity Research',
          url: BASE_URL + '/views/equity-research.html',
          height: 400
        });
      }
    }];
  },
  'card-detail-badges': function (t) {
    return t.get('card', 'shared').then(function (data) {
      var badges = [];
      if (data) {
        if (data.ticker) {
          badges.push({
            title: 'Ticker',
            text: data.ticker,
            color: 'blue'
          });
        }
        if (data.rating) {
          badges.push({
            title: 'Rating',
            text: data.rating,
            color: data.rating === 'Buy' ? 'green' :
                   data.rating === 'Sell' ? 'red' : 'yellow'
          });
        }
      }
      return badges;
    }).catch(function (e) {
      console.error('Failed to load equity research badges:', e);
      return [];
    });
  }
});
