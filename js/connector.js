/* global TrelloPowerUp, EquityUtils */
'use strict';

TrelloPowerUp.initialize({

  /* ── Card badges (shown on the card face in the board view) ──────────── */
  'card-badges': function (t) {
    return t.card('name').then(function (card) {
      var parsed = EquityUtils.parseTitle(card.name);
      if (!parsed) return [];
      return [
        {
          text: parsed.score.toFixed(1) + '\u202F/\u202F5.0',
          color: EquityUtils.scoreToTrelloColor(parsed.score),
          title: 'Composite Rating — ' + parsed.conviction
        }
      ];
    });
  },

  /* ── Card detail badges (shown on the card back) ─────────────────────── */
  'card-detail-badges': function (t) {
    return t.card('name', 'desc', 'due').then(function (card) {
      var parsed = EquityUtils.parseTitle(card.name);
      if (!parsed) return [];

      var badges = [
        {
          title: 'Composite Rating',
          text: EquityUtils.scoreToEmoji(parsed.score) + '\u2002' + parsed.score.toFixed(1) + ' / 5.0',
          color: EquityUtils.scoreToTrelloColor(parsed.score)
        },
        {
          title: 'Conviction',
          text: parsed.conviction
        }
      ];

      var meta = EquityUtils.parseDescription(card.desc);
      if (meta.stance) {
        badges.push({ title: 'Investment Stance', text: meta.stance });
      }
      if (meta.sector) {
        badges.push({ title: 'Sector', text: meta.sector });
      }
      if (meta.catalyst) {
        var catalyst = meta.catalyst.length > 60
          ? meta.catalyst.slice(0, 57) + '\u2026'
          : meta.catalyst;
        badges.push({ title: 'Primary Catalyst', text: catalyst });
      }
      if (meta.date) {
        badges.push({ title: 'Last Analyzed', text: meta.date });
      }

      return badges;
    });
  },

  /* ── Card buttons (shown on the card back) ───────────────────────────── */
  'card-buttons': function (t) {
    return t.card('name').then(function (card) {
      var parsed = EquityUtils.parseTitle(card.name);
      if (!parsed) return [];
      var ticker = parsed.ticker;

      return [
        {
          icon: EquityUtils.assetUrl('img/refresh.svg'),
          text: 'Re-evaluate',
          callback: function (t) {
            return t.popup({
              title: '\u27F3 Re-evaluate ' + ticker,
              url: EquityUtils.assetUrl('popup-re-evaluate.html') + '?ticker=' + encodeURIComponent(ticker),
              height: 230
            });
          }
        }
      ];
    });
  },

  /* ── Board buttons (shown in the board toolbar) ──────────────────────── */
  'board-buttons': function (t) {
    return [
      {
        icon: {
          dark:  EquityUtils.assetUrl('img/chart-dark.svg'),
          light: EquityUtils.assetUrl('img/chart-light.svg')
        },
        text: 'Portfolio Heatmap',
        callback: function (t) {
          return t.modal({
            url: EquityUtils.assetUrl('heatmap.html') + '?v=3',
            title: 'Portfolio Heatmap',
            fullscreen: true
          });
        }
      }
    ];
  }

});
