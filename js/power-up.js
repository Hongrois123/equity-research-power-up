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
    return t.card('all').then(function (card) {
      var badges = [];
      var pluginData = card.pluginData || [];
      pluginData.forEach(function (data) {
        if (data.scope === 'card' && data.idPlugin === t.getContext().idPlugin) {
          try {
            var parsed = JSON.parse(data.value);
            if (parsed.ticker) {
              badges.push({
                title: 'Ticker',
                text: parsed.ticker,
                color: 'blue'
              });
            }
            if (parsed.rating) {
              badges.push({
                title: 'Rating',
                text: parsed.rating,
                color: parsed.rating === 'Buy' ? 'green' :
                       parsed.rating === 'Sell' ? 'red' : 'yellow'
              });
            }
          } catch (e) {}
        }
      });
      return badges;
    });
  }
});
