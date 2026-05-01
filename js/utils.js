/* global TrelloPowerUp */
/* Shared parsing and colour helpers for the Equity Research Power-Up. */
'use strict';

var EquityUtils = (function () {

  /**
   * Parse an equity card title produced by the Copilot Agent workflow.
   *
   * Expected format (emojis are optional leading characters):
   *   [sector-emoji][company-emoji] TICKER — Company Name | X.X/5.0 | [emoji] Conviction Level
   *
   * Examples:
   *   "🛒🧂 MKC — McCormick & Company | 3.8/5.0 | 🟡 Moderate Conviction"
   *   "💻☁️ CRM — Salesforce | 3.9/5.0 | 🟡 Moderate Conviction"
   *   "🔍 GOOGL — Alphabet Inc. | 4.2/5.0 | 🔵 High Conviction"
   *
   * @param {string} name
   * @returns {{ ticker: string, score: number, conviction: string } | null}
   */
  function parseTitle(name) {
    // Accept em-dash (—), en-dash (–), or plain hyphen as the separator.
    // Use [^|]+ instead of .+? for the company name so pipe characters inside
    // company names do not cause a premature match failure.
    var m = name.match(
      /([A-Z][A-Z0-9.]{0,8})\s+[\u2014\u2013\-]+\s+[^|]+\|\s*(\d+\.?\d*)\/5\.0\s*\|\s*(.+)/
    );
    if (!m) return null;
    // Strip leading non-letter chars (emojis / colour squares) from conviction string.
    var conviction = m[3].trim().replace(/^[^A-Za-z]+/, '').trim();
    return {
      ticker: m[1],
      score: parseFloat(m[2]),
      conviction: conviction
    };
  }

  /**
   * Parse equity metadata from the card description footer block.
   *
   * Expected footer lines (written by the Copilot Agent):
   *   Date: YYYY-MM-DD
   *   Sector: [emoji] Sector Name | Industry: [emoji] Industry Name
   *   Investment Stance: [emoji] Stance
   *   Primary Catalyst: text
   *
   * @param {string} desc
   * @returns {{ date?: string, sector?: string, industry?: string, stance?: string, catalyst?: string }}
   */
  function parseDescription(desc) {
    if (!desc) return {};
    var result = {};
    var dateM = desc.match(/^Date:\s*(\d{4}-\d{2}-\d{2})/m);
    if (dateM) result.date = dateM[1];

    var sectorM = desc.match(/^Sector:\s*(.+?)\s*\|\s*Industry:\s*(.+?)$/m);
    if (sectorM) {
      result.sector = sectorM[1].replace(/^[^A-Za-z]+/, '').trim();
      result.industry = sectorM[2].replace(/^[^A-Za-z]+/, '').trim();
    }

    var stanceM = desc.match(/^Investment Stance:\s*(.+?)$/m);
    if (stanceM) result.stance = stanceM[1].replace(/^[^A-Za-z]+/, '').trim();

    var catalystM = desc.match(/^Primary Catalyst:\s*(.+?)$/m);
    if (catalystM) result.catalyst = catalystM[1].trim();

    return result;
  }

  /**
   * Map a composite score to a Trello badge colour name.
   * Matches the conviction bands defined in the Copilot Agent scoring rubric.
   *
   * @param {number} score
   * @returns {string} Trello colour name
   */
  function scoreToTrelloColor(score) {
    if (score >= 4.5) return 'green';
    if (score >= 4.0) return 'blue';
    if (score >= 3.5) return 'yellow';
    if (score >= 3.0) return 'orange';
    return 'red';
  }

  /**
   * Map a composite score to hex fill and foreground colours for the heatmap tiles.
   *
   * @param {number} score
   * @returns {{ bg: string, fg: string }}
   */
  function scoreToHeatmapColor(score) {
    if (score >= 4.5) return { bg: '#61bd4f', fg: '#fff' };  // green  — Very High
    if (score >= 4.0) return { bg: '#0079bf', fg: '#fff' };  // blue   — High
    if (score >= 3.5) return { bg: '#d9b51c', fg: '#fff' };  // yellow — Moderate
    if (score >= 3.0) return { bg: '#e6a118', fg: '#fff' };  // orange — Selective
    return            { bg: '#eb5a46', fg: '#fff' };          // red    — Avoid
  }

  /**
   * Return the conviction emoji that matches the scoring rubric.
   *
   * @param {number} score
   * @returns {string}
   */
  function scoreToEmoji(score) {
    if (score >= 4.5) return '\uD83D\uDC9A'; // 💚
    if (score >= 4.0) return '\uD83D\uDD35'; // 🔵
    if (score >= 3.5) return '\uD83D\uDFE1'; // 🟡
    if (score >= 3.0) return '\uD83D\uDFE0'; // 🟠
    return '\uD83D\uDD34';                   // 🔴
  }

  /**
   * Build an absolute URL for a Power-Up asset relative to the connector page.
   * Works whether the connector is served from GitHub Pages or a local server.
   *
   * @param {string} path — relative path, e.g. "heatmap.html" or "img/chart-light.svg"
   * @returns {string} absolute https URL
   */
  function assetUrl(path) {
    var base = window.location.href.replace(/\/[^/]*(\?.*)?$/, '/');
    return base + path;
  }

  return {
    parseTitle: parseTitle,
    parseDescription: parseDescription,
    scoreToTrelloColor: scoreToTrelloColor,
    scoreToHeatmapColor: scoreToHeatmapColor,
    scoreToEmoji: scoreToEmoji,
    assetUrl: assetUrl
  };
})();
