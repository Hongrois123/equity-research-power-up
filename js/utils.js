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
    var m;

    // Format 1 (standard): [emojis] TICKER — Company Name | X.X/5.0 | [emoji] Conviction
    // e.g. "💻 CRM — Salesforce | 3.9/5.0 | 🟡 Moderate Conviction"
    m = name.match(
      /([A-Z][A-Z0-9.]{0,8})\s+[\u2014\u2013\-]+\s+[^|]+\|\s*(\d+\.?\d*)\/5\.0\s*\|\s*(.+)/
    );

    // Format 2 (exchange-prefixed): Company Name (EXCHANGE:TICKER) — ... | X.X/5.0 | Conviction
    // e.g. "Walt Disney (NYSE:DIS) — Walt Disney | 3.6/5.0 | Moderate Conviction"
    if (!m) {
      m = name.match(
        /\([A-Z]+:([A-Z][A-Z0-9.]{0,8})\)\s*[\u2014\u2013\-]+\s*[^|]+\|\s*(\d+\.?\d*)\/5\.0\s*\|\s*(.+)/
      );
    }

    if (!m) return null;
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

    // Date: matches "date:", "Date:", "Last Reviewed:", "Analysis Date:", "**Analysis Date:**" etc.
    var dateM = desc.match(/\*{0,2}(?:last\s+reviewed|date|analysis\s+date)\*{0,2}:?\*{0,2}\s+(\d{4}-\d{2}-\d{2})/i);
    if (dateM) result.date = dateM[1];

    // Sector: case-insensitive; matches "sector:", "Sector:", "**Sector:**" etc.
    var sectorM = desc.match(/\*{0,2}sector:\*{0,2}\s*([^|\n\r*]+)/i);
    if (sectorM) result.sector = sectorM[1].replace(/^[^A-Za-z]+/, '').replace(/\s+$/, '');

    // Industry: optional, on same line after "|"
    var industryM = desc.match(/\|[^\n\r]*\*{0,2}industry:\*{0,2}\s*([^|\n\r*]+)/i);
    if (industryM) result.industry = industryM[1].replace(/^[^A-Za-z]+/, '').replace(/\s+$/, '');

    // Stance: handles all formats — "Investment Stance:", "investment_stance:", "Current Stance:", "Stance:"
    // The colon prevents matching section headings like "## Investment Stance"
    var stanceM = desc.match(/\*{0,2}(?:(?:investment[_ ]|current\s+)?stance):\*{0,2}\s*\*{0,2}([^\n\r*#]+)/i);
    if (stanceM) result.stance = stanceM[1].replace(/^[^A-Za-z0-9\u00C0-\u024F\u2600-\uFFFF]+/, '').replace(/\s+$/, '');

    // Primary Catalyst
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
