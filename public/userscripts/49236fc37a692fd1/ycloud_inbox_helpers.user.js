// ==UserScript==
// @name         YCloud: ayudas para la bandeja (MMD Lab)
// @namespace    https://mmdlab.tech/
// @version      0.5.4
// @description  Vínculos cliente-vendedor que se pulsan, búsqueda por palabras o número y chats en espera en color en la bandeja de YCloud. Solo lee: no escribe nada.
// @match        https://www.ycloud.com/console/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://mmdlab.tech/userscripts/49236fc37a692fd1/ycloud_inbox_helpers.user.js
// @downloadURL  https://mmdlab.tech/userscripts/49236fc37a692fd1/ycloud_inbox_helpers.user.js
// ==/UserScript==

/*
 * Tool: ycloud_inbox_helpers (Tampermonkey userscript, JavaScript by the operator's request of 2026-11-10)
 * Description: helpers inside YCloud's inbox console, for the team that works there.
 *
 * Input: none. It runs in the console page of whoever is signed in and uses the console's own internal calls (no API
 *   key): GET /api/tenant/list, GET /api/contacts/get?id=, POST /api/contacts/search,
 *   POST /api/inbox/conversation/advancedSearch, and the inbox's «advancedSearch» message, which is what YCloud's own
 *   «View in Inbox» button uses. It also reads the conversation each row of the inbox list was drawn from (React props).
 * Output, in the page:
 *   0. It works only in the accounts listed in TENANTS (Checkar's, and ours for tests). The console's current account
 *      is read at the start, before every action and every read of contacts or conversations, and every TENANT_EVERY:
 *      outside the listed accounts (or while the account cannot be read) nothing is read, shown or answered to a
 *      shortcut, and when the account changes whatever was shown or started for the previous one is dropped (panel,
 *      notices, links, marks, cached names; reads still running are discarded). In a listed account, also when the
 *      page started in another or the first read failed, it shows up within TENANT_EVERY.
 *   1. Linked contacts, as buttons with the contact's name: in a strip next to the helper's buttons for the open chat,
 *      and under «Vendedor(es)» and «Cliente(s)» in a conversation's details. A click filters the inbox to that
 *      contact and opens its conversation; with several (one per business number) it asks which. It clicks only a row
 *      whose conversation it identifies by ID (one conversation among the row's current React props, its contact's name
 *      or number in the row's text), and checks that the chat opened is that one. When it identifies no row of that
 *      contact, it asks the console how many conversations the contact has, open and closed, and says that (none at
 *      all, only closed ones and when the last ended, or open ones it does not see), never a guess. Alt+V: the first link.
 *   2. Search (Alt+B, or the 🔎 button): contacts whose name or number has every word typed, in any order; the results
 *      come while typing (half a second after the last key, from three characters) and on Enter; a change of the text
 *      cancels the search in flight and clears what was shown, so nothing stale can be clicked. The console is asked
 *      for the longest word typed, but a role word («vendedor», «cliente», in hundreds of names) only when nothing
 *      else was typed. A whole
 *      number must match exactly: the number in YCloud's answer is checked, and two contacts with it are ambiguous, so
 *      none is chosen. A piece of a number is looked for only among the contacts with an open conversation, because
 *      the console finds numbers only when whole. It can keep all («Todos»), those with an open conversation on a
 *      business number YCloud shows as connected («Conversación abierta») or those with a closed one, even if another
 *      is open («Conversación cerrada»). Each result says whether its open conversations wait for a reply, or when its
 *      last closed one ended. A malformed or cut read says so («lectura inconclusa», «parciales») and never «none».
 *   3. Waiting chats: in the conversation list, an open chat whose last message (system notes aside) is the customer's
 *      is marked green, amber from 15 minutes and red from 60 (WAIT), with the time since that message, only on a
 *      business number YCloud shows as connected. A number no longer connected («Desatado»: nobody can reply there),
 *      one whose connection is not shown, and anything unclear stay plain.
 * It only reads and shows: it never writes to YCloud, never puts text in the console's boxes and never sends anything
 *   (the operator, 2026-11-11: «solo búsqueda y lectura, que no escriba ni modifique nada»; messages and templates go
 *   the usual way). Version 0.4.0 had replies with variables that went into the text box; they are gone.
 * Errors: a short message in the helper's panel or notice.
 * Limits: it depends on how YCloud's console is built today (shadow DOM, React rows, internal calls). When that
 *   changes it stops showing things rather than showing wrong ones.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------- pure helpers (also tested with node)
  const INCONCLUSIVE = 'lectura inconclusa';
  const MARKS = /[̀-ͯ]/g;
  // for searching: capitals, no accents (Ñ -> N), single spaces
  const plain = (s) => String(s || '').normalize('NFD').replace(MARKS, '').toUpperCase().replace(/\s+/g, ' ').trim();
  const ROLE_WORDS = /^(VENDEDOR|VENDEDORA|VENDEDORES|CLIENTE|CLIENTES)$/;   // in hundreds of names: a poor word to ask for
  const PAGE = 100;        // contacts a page of the console's search
  const MAX_PAGES = 5;     // pages read per word before the answer is called partial
  const MAX_READS = 10;    // pages read per search in all, whatever the number of words (the reviewer, 2026-11-11)
  function e164(raw) {
    const text = String(raw || '').trim();
    let digits = text.replace(/\D/g, '');
    const international = text.startsWith('+') || digits.startsWith('00');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (!international && digits.length === 9 && '6789'.includes(digits[0])) digits = '34' + digits;
    return digits.length >= 10 && digits.length <= 15 ? '+' + digits : null;
  }

  const splitNumbers = (value) => [...new Set((Array.isArray(value) ? value : String(value || '').split(/[,;\n]+/))
    .map(e164).filter(Boolean))];

  const hasAllWords = (text, words) => words.every((w) => plain(text).includes(plain(w)));

  function searchPlan(input) {
    // A whole number is searched exactly. Otherwise the console is asked for one word at a time («conditions», in the
    // order to try: the words with letters that name no role, longest first, then the role words; it finds a number
    // only when whole, so a piece of one is asked for only when nothing else was typed), and every word must then be
    // in the contact's name, nickname or number; «pieces» says whether a piece of a number was typed.
    const text = String(input || '').trim();
    const m = text.match(/\+?\d[\d\s().-]{7,}\d/);
    const exact = m ? e164(m[0]) : null;
    const words = (exact ? text.replace(m[0], ' ') : text).split(/\s+/)
      .map((w) => (/^[+\d().-]+$/.test(w) ? w.replace(/\D/g, '') : w)).filter((w) => w.length > 1);
    const byLength = (list) => [...list].sort((a, b) => b.length - a.length);
    // the words that name a role are in hundreds of contacts («VENDEDOR …» is how sellers are named), so they are
    // asked for only after every other word: any other word narrows the console's answer far more
    const lettered = words.filter((w) => /\D/.test(w));
    const telling = lettered.filter((w) => !ROLE_WORDS.test(plain(w)));
    const roles = lettered.filter((w) => ROLE_WORDS.test(plain(w)));
    const seen = new Set();
    const conditions = exact ? [] : [...byLength(telling), ...byLength(roles)].filter((w) => !seen.has(plain(w)) && seen.add(plain(w)));
    if (!exact && !conditions.length && words.length) conditions.push(byLength(words)[0]);
    return { exact, words, condition: conditions[0] || null, conditions, pieces: !exact && words.some((w) => /^\d{3,}$/.test(w)) };
  }

  async function searchContacts(plan, maxPages, fetchPage, maxReads = MAX_READS) {
    // The console is asked for one word at a time (plan.conditions, in order), PAGE contacts a page, and every word
    // must then be in the contact's name, nickname or number. Which word has the fewest contacts is not known in
    // advance (a city is in hundreds of names, a model code in a few), so page 1 of each word is read first: the
    // first word that fits in one page gives a complete answer at one read. Only when every word fills its first
    // page are the next pages read, word by word up to maxPages, until one word completes. A contact with all the
    // words contains each of them, so a complete read of any one word holds every match, and whatever the cut reads
    // found is kept too. The whole search reads at most maxReads pages, however many words were typed. «partial»
    // says no word completed (its pages or the budget ran out); «cut» names the words whose reads were cut.
    const found = new Map();
    const take = (recs) => {
      for (const r of recs) {
        const name = r['Remark name'] || r.Nickname || '';
        if (hasAllWords([name, r.Nickname, r['Phone number']].join(' '), plan.words)) {
          found.set(String(r.contactId), { id: String(r.contactId), phone: r['Phone number'], name: name || r['Phone number'] });
        }
      }
    };
    const done = (partial, cut) => ({ found: [...found.values()], partial, cut });
    const candidates = plan.conditions || (plan.condition ? [plan.condition] : []);
    let reads = 0;
    const read = async (word, page) => { reads++; return fetchPage(word, page); };
    const started = [];
    for (const word of candidates) {
      if (reads >= maxReads) return done(true, started);
      const recs = await read(word, 1);
      started.push(word);
      take(recs);
      if (recs.length < PAGE) return done(false, []);
    }
    for (const word of candidates) {
      for (let page = 2; page <= maxPages && reads < maxReads; page++) {
        const recs = await read(word, page);
        take(recs);
        if (recs.length < PAGE) return done(false, []);
      }
      if (reads >= maxReads) break;
    }
    return done(candidates.length > 0, started);   // every word read and none complete: all of them were cut
  }

  function waitState(conv, now) {
    // «waiting»: open, on a business number YCloud shows as connected («Desatado» in the console means it is not, and
    // then nobody can reply there; a connection not shown is not assumed), and its last message (system notes aside,
    // as YCloud's list preview) is the customer's
    const none = { state: 'unknown', since: null, minutes: null };
    if (!conv) return none;
    if (conv.status === 0) return { state: 'closed', since: null, minutes: null };
    if (conv.status !== 1) return none;
    if (conv.inbox && conv.inbox.bind === false) return { state: 'unbound', since: null, minutes: null };
    if (!conv.inbox || conv.inbox.bind !== true) return none;
    const m = conv.previewMessage;
    const at = Number(m && m.additionalAttributes && m.additionalAttributes.sendTime) || null;
    if (!m || !at) return none;
    if (m.messageDirection === 1) return { state: 'answered', since: at, minutes: null };
    if (m.messageDirection !== 0) return none;
    return { state: 'waiting', since: at, minutes: Math.max(0, Math.floor(((now || Date.now()) - at) / 60000)) };
  }

  function pickContact(res, phone) {
    // the one contact with exactly that number in an answer to a search for it: an answer without its list, or with a
    // contact of another number, is inconclusive; two contacts with the number are ambiguous and none is chosen
    const recs = res && res.data && res.data.records;
    if (!Array.isArray(recs) || recs.some((r) => !r || !r.contactId)) throw new Error(INCONCLUSIVE);
    const mine = recs.filter((r) => e164(r['Phone number']) === phone);
    if (mine.length < recs.length) throw new Error(INCONCLUSIVE);
    if (mine.length > 1) return { ambiguous: true, phone, name: phone };
    const r = mine[0];
    return r ? { id: String(r.contactId), phone, name: r['Remark name'] || r.Nickname || phone } : null;
  }

  function contactRecords(res) {
    // a page of a contact search: its list, every record with its id, or inconclusive
    const recs = res && res.data && res.data.records;
    if (!Array.isArray(recs) || recs.some((r) => !r || !r.contactId)) throw new Error(INCONCLUSIVE);
    return recs;
  }

  function contactCard(res, id) {
    // the card of exactly the contact asked for: an answer without the contact's id, with another id, or with a
    // malformed attribute list is inconclusive (its links would otherwise be shown as the open contact's)
    const d = res && res.data;
    const got = d && typeof d === 'object' ? (d.id != null ? d.id : d.contactId) : null;
    if (got == null || String(got) !== String(id) || (d.customAttrs != null && !Array.isArray(d.customAttrs))) {
      throw new Error(INCONCLUSIVE);
    }
    return d;
  }

  function accountConversations(res, tenantId) {
    // a page of conversations: its list, every one with its ids and from the account the helper is working in
    const conv = res && res.data && res.data.conversation;
    if (!Array.isArray(conv) || conv.some((c) => !c || !c.id || !c.contactId || c.tenantId !== tenantId)) {
      throw new Error(INCONCLUSIVE);
    }
    return conv;
  }

  function countFromPage(res, tenantId, contactId) {
    // how many conversations a page says one contact has: YCloud's own total when the page carries it (exact), else
    // what the page shows (exact only when it shows none); a page with another contact's conversation is inconclusive
    const conv = accountConversations(res, tenantId);
    if (conv.some((c) => String(c.contactId) !== String(contactId))) throw new Error(INCONCLUSIVE);
    const meta = res.data.meta;
    const raw = meta && meta.total != null ? Number(meta.total) : NaN;
    const total = Number.isInteger(raw) && raw >= 0 ? raw : null;          // anything else is as if no total came
    if (total !== null && total > 0 && conv.length === 0) throw new Error(INCONCLUSIVE);   // a first page that shows none of a positive total is contradictory
    if (total !== null && total >= conv.length) return { count: total, exact: true, newest: conv[0] || null };
    return { count: conv.length, exact: conv.length === 0, newest: conv[0] || null };
  }

  function noRowsMessage(name, phone, open, closed, closedWhen) {
    // what to say when the inbox was asked to filter by a contact and no row of that contact could be identified:
    // the facts the console gave (open and closed counts), never a guess
    const who = name + ' (' + phone + ')';
    const some = (c, one, many) => (c.exact ? '' : 'al menos ') + (c.count === 1 ? one : c.count + ' ' + many);
    if (open.count > 0) {
      return who + ' tiene ' + some(open, 'una conversación abierta', 'conversaciones abiertas') + ' que no veo en la lista. '
        + 'He pedido a la bandeja que filtre por este contacto; si no aparece, búscalo por su número.';
    }
    if (closed.count > 0) {
      return who + ' no tiene ninguna conversación abierta; tiene ' + some(closed, 'una cerrada', 'cerradas')
        + (closedWhen ? ', con última actividad el ' + closedWhen : '') + '. He pedido a la bandeja que filtre por este contacto; '
        + 'cambia el estado a cerradas para verla, o búscalo por su número.';
    }
    return who + ' no tiene conversaciones en esta cuenta de YCloud, ni abiertas ni cerradas.';
  }

  function makeSearchRuns() {
    // one search at a time: starting a new one aborts the reads of the one before, and a run paints only while it is
    // the current one, so a late answer never shows under newer text
    let current = null, n = 0;
    return {
      start() { if (current) current.ctrl.abort(); current = { id: ++n, ctrl: new AbortController() }; return current; },
      cancel() { if (current) current.ctrl.abort(); current = null; },
      isCurrent(run) { return Boolean(run && current) && current.id === run.id && !run.ctrl.signal.aborted; },
    };
  }

  function makeTyping({ delay, minChars, schedule, unschedule, search, invalidate }) {
    // search while typing: «delay» after the last change of the text, from «minChars». A change of the text drops what
    // was scheduled and invalidates what is shown and the search in flight, so nothing stale stays on screen; the text
    // already shown is not searched again; Enter searches at once; a change of filter searches the current text at once
    let timer = null, shownFor = '';
    const drop = () => { if (timer !== null) { unschedule(timer); timer = null; } };
    return {
      input(text) {
        const t = String(text || '').trim();
        if (t === shownFor) { drop(); return false; }
        drop(); invalidate(); shownFor = null;
        if (t.length < minChars) return false;
        timer = schedule(() => { timer = null; shownFor = t; search(t); }, delay);
        return true;
      },
      enter(text) { drop(); const t = String(text || '').trim(); shownFor = t; search(t); },
      filterChanged(text) { drop(); invalidate(); const t = String(text || '').trim(); shownFor = t; if (t) search(t); },
    };
  }

  // reading React: the props a DOM element was drawn with, and the two copies React keeps of its fiber (one of them
  // can be stale: a row recycled for another conversation; what tells them apart is what the row shows)
  const reactKey = (el, prefix) => Object.keys(el).find((k) => k.startsWith(prefix));
  const propsOf = (el) => { const k = el && reactKey(el, '__reactProps$'); return k ? el[k] : null; };
  const fiberOf = (el) => { const k = el && reactKey(el, '__reactFiber$'); return k ? el[k] : null; };
  const copiesOf = (el) => { const f = fiberOf(el); return f ? [f, f.alternate].filter(Boolean) : []; };
  const displayName = (c) => (c && (c.remarkName || c.nickName || c.phoneNumber)) || '';
  const isConversation = (v) => Boolean(v && typeof v === 'object' && v.id && v.contactId && v.inbox && v.contact
    && 'lastActivityAt' in v);

  function rowConversation(el) {
    // the conversation a list row was drawn from, only when it is unambiguous: among the conversations a few levels
    // down the row's two copies, exactly one id whose contact's name or number is in the row's text (a stale copy of
    // a recycled row carries another contact, which the row does not show)
    const text = (el && el.innerText) || '';
    const digits = text.replace(/\D/g, '');
    const shown = (c) => {
      // the name as the team typed it can carry a trailing or a double space, which the row does not draw: compare
      // both sides normalised (spaces collapsed, accents and case ignored)
      const name = plain(displayName(c.contact));
      const phone = String(c.contact.phoneNumber || '').replace(/\D/g, '');
      return Boolean((name && plain(text).includes(name)) || (phone.length > 7 && digits.includes(phone)));
    };
    const found = new Map();
    for (const start of copiesOf(el)) {
      for (let n = start, depth = 0; n && depth < 6; n = n.child, depth++) {
        const p = n.memoizedProps;
        if (!p || typeof p !== 'object') continue;
        for (const v of Object.values(p)) {
          if (!isConversation(v) || !shown(v)) continue;
          const had = found.get(String(v.id));
          if (!had || Number(v.lastActivityAt || 0) > Number(had.lastActivityAt || 0)) found.set(String(v.id), v);
        }
      }
    }
    return found.size === 1 ? [...found.values()][0] : null;
  }

  function tenantStep(state, tenantId, allowed) {
    // the state after reading the console's current account: a change (or a failed read) starts a new epoch, and what
    // was started in the old one is dropped
    const tenant = tenantId || null;
    const changed = tenant !== state.tenant;
    return { tenant, active: Boolean(tenant && allowed[tenant]), epoch: changed ? state.epoch + 1 : state.epoch, changed };
  }

  const helpers = { plain, e164, splitNumbers, hasAllWords, searchPlan, searchContacts, waitState, pickContact, contactRecords,
    contactCard, accountConversations, countFromPage, noRowsMessage, makeSearchRuns, makeTyping, rowConversation, tenantStep,
    INCONCLUSIVE };
  if (typeof module !== 'undefined' && module.exports) { module.exports = helpers; return; }   // node tests
  if (window.__mmdYcloudHelpers) return;                                                        // once per page
  window.__mmdYcloudHelpers = helpers;

  // ---------------------------------------------------------------- settings
  const TENANTS = { '6ad664e2c02ec50d17c9a99c': 'Checkar', '69f5eec2887c2625c9378f7b': 'MMD Lab (pruebas)' };
  const TENANT_EVERY = 10000;                    // ms between reads of the console's current account
  const WAIT = { amber: 15, red: 60 };           // minutes since the customer's last message; green below amber
  const LINK_LABELS = /^(vendedor|vendedores|cliente|clientes)$/i;
  const FILTER = 'mmd-search-filter';            // the search filter last chosen
  const MAX_NAMES = 10;                          // linked numbers whose names are looked up straight away
  const SEARCH = '🔎 Buscar contactos';
  const OFF = 'Las ayudas de MMD Lab no funcionan en esta cuenta de YCloud.';
  const STALE = 'Ha cambiado la cuenta de YCloud: lo que estaba en marcha se ha descartado.';

  // ---------------------------------------------------------------- the console's own calls
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const api = async (url, body, signal) => {
    const r = await fetch(url, body ? { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal } : { credentials: 'include', signal });
    if (!r.ok) throw new Error('YCloud respondió ' + r.status);
    return r.json();
  };

  // ---------------------------------------------------------------- the account, read before every action and read
  let account = { tenant: null, active: false, epoch: 0 };
  let tenantRead = null;

  function currentTenant() {
    // one read at a time, shared by whoever asks while it runs; null when it cannot be read
    if (!tenantRead) {
      tenantRead = (async () => {
        for (let i = 0; i < 3; i++) {
          try { const t = await api('/api/tenant/list'); return (t && t.data && t.data.currentTenantId) || null; } catch (e) { await sleep(1000); }
        }
        return null;
      })().finally(() => { tenantRead = null; });
    }
    return tenantRead;
  }

  async function checkAccount() {
    account = tenantStep(account, await currentTenant(), TENANTS);
    if (account.changed || !account.active) teardown();
    return account;
  }

  async function guard() {
    // before every action and every read of contacts or conversations; gives the epoch the work belongs to
    const now = await checkAccount();
    if (!now.active) throw new Error(OFF);
    return now.epoch;
  }

  const sameEpoch = (epoch) => account.active && account.epoch === epoch;
  function stillSame(epoch) { if (!sameEpoch(epoch)) throw new Error(STALE); }

  async function read(url, body, signal) {
    const epoch = await guard();
    const res = await api(url, body, signal);
    stillSame(epoch);
    return res;
  }

  async function contactByPhone(phone, signal) {
    return pickContact(await read('/api/contacts/search', { pageNo: 1, pageSize: 2,
      query: { connector: 'AND', filters: [{ connector: 'AND', conditions: [{ column: 'Phone number', operator: 'IS', values: [phone] }] }] } }, signal), phone);
  }

  async function contactGet(id) {
    return contactCard(await read('/api/contacts/get?id=' + encodeURIComponent(id)), id);
  }

  const nameCache = new Map();                   // number -> contact, null when it is not one; emptied with the account
  async function nameOf(n) {
    if (!nameCache.has(n)) nameCache.set(n, await contactByPhone(n));
    return nameCache.get(n);
  }

  async function findContacts(plan, maxPages, signal) {
    if (plan.exact) {
      const c = await contactByPhone(plan.exact, signal);
      if (c && c.ambiguous) return { found: [], partial: false, ambiguous: true };
      return { found: c && hasAllWords([c.name, c.phone].join(' '), plan.words) ? [c] : [], partial: false };
    }
    return searchContacts(plan, maxPages, async (condition, pageNo) =>
      contactRecords(await read('/api/contacts/search', { pageNo, pageSize: PAGE, condition }, signal)));
  }

  async function openConversations(maxPages, signal) {
    const list = [];
    let total = null;
    for (let page = 1; page <= maxPages; page++) {
      const res = await read('/api/inbox/conversation/advancedSearch', { pageNo: page, pageSize: 100, order: 'newest',
        status: 1, query: { filters: [], connector: 'AND' } }, signal);
      const conv = accountConversations(res, account.tenant);
      const meta = res.data.meta;
      if (meta && meta.total != null) total = Number(meta.total);
      list.push(...conv);
      if (conv.length < 100) break;
    }
    // complete only when YCloud's own total says so
    return { list, partial: total === null || !Number.isFinite(total) || list.length < total };
  }

  async function lastClosed(contactId, signal) {
    const conv = accountConversations(await read('/api/inbox/conversation/advancedSearch', { pageNo: 1, pageSize: 1,
      order: 'newest', status: 0, contactId, query: { filters: [], connector: 'AND' } }, signal), account.tenant);
    if (conv[0] && String(conv[0].contactId) !== String(contactId)) throw new Error(INCONCLUSIVE);
    return conv[0] || null;
  }

  async function conversationCounts(contactId) {
    // one contact's open and closed conversations, as the console counts them (the newest of each as well)
    const page = async (status) => countFromPage(await read('/api/inbox/conversation/advancedSearch', { pageNo: 1,
      pageSize: 1, order: 'newest', status, contactId, query: { filters: [], connector: 'AND' } }), account.tenant, contactId);
    return { open: await page(1), closed: await page(0) };
  }

  async function pool(items, size, fn) {
    // fn over the items, at most «size» at a time
    const queue = [...items];
    await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift());
    }));
  }

  // ---------------------------------------------------------------- reading the inbox page
  const shadow = () => { const app = document.querySelector('wujie-app'); return app && app.shadowRoot; };
  const inboxBus = () => {
    const f = document.querySelector('iframe[name="yCloud-inbox-web"]');
    return f && f.contentWindow && f.contentWindow.$wujie && f.contentWindow.$wujie.bus;
  };

  function conversationRows() {
    // the list's rows whose conversation is identified, from the account the helper is working in
    const sr = shadow();
    if (!sr || !account.active) return [];
    const rows = [];
    for (const el of sr.querySelectorAll('[data-item-index]')) {
      const conv = rowConversation(el);
      if (conv && conv.tenantId === account.tenant) rows.push({ el, conv });
    }
    return rows;
  }

  function messageRows() {
    const sr = shadow();
    return sr ? [...sr.querySelectorAll('[data-item-index]')].filter((el) => {
      const p = propsOf(el);
      return p && p.item && p.item.inboxConversationId;
    }) : [];
  }

  function openConversationId() {
    // the open chat: every message shown must belong to the same conversation
    const ids = new Set(messageRows().map((el) => String(propsOf(el).item.inboxConversationId)));
    return ids.size === 1 ? [...ids][0] : null;
  }

  function openContactId() {
    // the open chat's contact, only from that conversation: its row in the list, else what its messages were drawn with
    const convId = openConversationId();
    if (!convId) return null;
    const row = conversationRows().find((r) => String(r.conv.id) === convId);
    if (row) return String(row.conv.contactId);
    const ids = new Set();
    for (const el of messageRows()) {
      for (const start of copiesOf(el)) {
        for (let n = start, depth = 0; n && depth < 4; n = n.child, depth++) {
          const c = n.memoizedProps && n.memoizedProps.contact;
          if (c && c.contactId) ids.add(String(c.contactId));
        }
      }
    }
    return ids.size === 1 ? [...ids][0] : null;
  }

  const clickable = (el) => [el, ...el.querySelectorAll('*')].find((e) => {
    const p = propsOf(e);
    return p && typeof p.onClick === 'function';
  }) || null;

  const ago = (min) => (min < 1 ? 'ahora' : min < 60 ? min + ' min' : min < 1440 ? Math.floor(min / 60) + ' h'
    : Math.floor(min / 1440) + ' d');
  function clock(ms) {
    const d = new Date(ms);
    const hm = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString() ? hm
      : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ' ' + hm;
  }
  function stateText(conv) {
    const w = waitState(conv, Date.now());
    if (w.state === 'closed') return 'cerrada';
    if (w.state === 'unbound') return 'abierta en un número desvinculado (no se puede responder)';
    if (w.state === 'waiting') return 'abierta · espera respuesta desde ' + clock(w.since) + ' (' + ago(w.minutes) + ')';
    if (w.state === 'answered') return 'abierta · respondida';
    return 'abierta';
  }

  // ---------------------------------------------------------------- styles, panel and notices
  const chipCss = `
    .mmd-chip{font:12px/1.6 system-ui,sans-serif;border:1px solid #602DED;color:#602DED;background:#fff;border-radius:12px;
      padding:0 8px;cursor:pointer;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .mmd-chip:hover{background:#602DED;color:#fff}`;
  const pageCss = chipCss + `
    #mmd-bar{position:fixed;right:24px;bottom:24px;z-index:2147483000;display:flex;flex-direction:column;
      align-items:flex-end;gap:6px;max-width:40vw}
    #mmd-bar .mmd-buttons{display:flex;gap:6px}
    #mmd-bar .mmd-buttons>button{font:13px system-ui,sans-serif;border:0;border-radius:18px;padding:8px 12px;
      background:#602DED;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}
    #mmd-links{display:flex;flex-wrap:wrap;align-items:center;gap:4px;background:#fff;border:1px solid #ddd;
      border-radius:16px;padding:4px 8px;box-shadow:0 2px 8px rgba(0,0,0,.15);font:12px system-ui,sans-serif;color:#555}
    #mmd-toast{position:fixed;left:50%;top:72px;transform:translateX(-50%);z-index:2147483000;max-width:80vw;
      background:#222;color:#fff;font:13px system-ui,sans-serif;border-radius:8px;padding:8px 12px;
      box-shadow:0 4px 16px rgba(0,0,0,.25)}
    #mmd-bar[hidden],#mmd-links[hidden],#mmd-toast[hidden]{display:none}
    #mmd-panel{position:fixed;right:24px;bottom:80px;z-index:2147483000;width:380px;max-width:calc(100vw - 32px);
      max-height:60vh;overflow:auto;background:#fff;border:1px solid #ddd;border-radius:10px;
      box-shadow:0 6px 24px rgba(0,0,0,.2);font:13px system-ui,sans-serif;color:#222;padding:10px}
    #mmd-panel input,#mmd-panel textarea,#mmd-panel select{width:100%;box-sizing:border-box;margin:4px 0;padding:6px;
      font:13px system-ui,sans-serif}
    #mmd-panel .mmd-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    #mmd-panel .mmd-fields label{font-size:12px;color:#555}
    #mmd-panel .row{padding:6px;border-bottom:1px solid #eee;cursor:pointer}
    #mmd-panel .row:hover{background:#f3efff}
    #mmd-panel .muted{color:#777;font-size:12px}`;
  const shadowCss = chipCss + `
    .mmd-chips{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 6px 0}
    [data-mmd-wait]{position:relative}
    [data-mmd-wait]::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;z-index:1;pointer-events:none;
      background:var(--mmd-wait)}
    [data-mmd-wait]::after{content:attr(data-mmd-label);position:absolute;right:10px;bottom:8px;z-index:1;
      pointer-events:none;font:600 11px/16px system-ui,sans-serif;color:#fff;background:var(--mmd-wait);
      border-radius:8px;padding:0 6px}
    [data-mmd-wait][data-mmd-unread]::after{right:58px}
    [data-mmd-wait="green"]{--mmd-wait:#188038}
    [data-mmd-wait="amber"]{--mmd-wait:#e37400}
    [data-mmd-wait="red"]{--mmd-wait:#d93025}`;

  function ensureShadowStyle() {
    const sr = shadow();
    if (!sr || sr.getElementById('mmd-shadow-style')) return;
    const s = document.createElement('style');
    s.id = 'mmd-shadow-style';
    s.textContent = shadowCss;
    (sr.querySelector('head') || sr).appendChild(s);
  }

  function closeIfOpen(titleText) {
    // the same button closes its own panel
    const p = document.getElementById('mmd-panel');
    if (!p || p.dataset.title !== titleText) return false;
    p.remove();
    return true;
  }

  function panel(titleText) {
    const old = document.getElementById('mmd-panel');
    if (old) old.remove();
    const p = document.createElement('div');
    p.id = 'mmd-panel';
    p.dataset.title = titleText;
    const bar = document.getElementById('mmd-bar');
    if (bar && !bar.hidden) {                                       // right above the buttons, up to the chat's header
      const b = bar.getBoundingClientRect();
      p.style.right = Math.round(innerWidth - b.right) + 'px';
      p.style.bottom = Math.round(innerHeight - b.top + 8) + 'px';
      p.style.maxHeight = Math.max(200, Math.round(b.top - 8 - 72)) + 'px';
    }
    const h = document.createElement('div');
    h.style.cssText = 'font-weight:600;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px';
    h.textContent = titleText;
    const x = document.createElement('button');
    x.type = 'button';
    x.textContent = '×';
    x.title = 'Cerrar (Esc)';
    x.style.cssText = 'border:0;background:none;font-size:18px;line-height:1;cursor:pointer;color:#777';
    x.addEventListener('click', () => p.remove());
    h.appendChild(x);
    p.appendChild(h);
    document.body.appendChild(p);
    return p;
  }

  function row(p, text, sub, onClick) {
    const r = document.createElement('div');
    r.className = 'row';
    r.textContent = text;
    if (sub) { const s = document.createElement('div'); s.className = 'muted'; s.textContent = sub; r.appendChild(s); }
    r.addEventListener('click', onClick);
    p.appendChild(r);
  }

  function muted(p, text) {
    const d = document.createElement('div');
    d.className = 'muted';
    d.textContent = text;
    p.appendChild(d);
    return d;
  }

  function placeBar(bar) {
    // bottom right of the open chat's messages, just above YCloud's notices and text box (the operator's choice of
    // 2026-11-11), so it covers neither; it follows the chat's edge when the details panel opens. With no chat open,
    // bottom right of the page. Panels open upwards from it.
    const first = messageRows()[0];
    const area = first && first.closest('[data-virtuoso-scroller]');
    const box = area ? area.getBoundingClientRect() : null;
    setStyle(bar, 'right', Math.round(box ? innerWidth - box.right + 24 : 24) + 'px');
    setStyle(bar, 'bottom', Math.round(box ? innerHeight - box.bottom + 12 : 24) + 'px');
    setStyle(bar, 'maxWidth', Math.round(Math.max(220, (box ? box.width : innerWidth / 2) * 0.4)) + 'px');
  }
  const setStyle = (el, k, v) => { if (el.style[k] !== v) el.style[k] = v; };

  function toast(text) {
    let t = document.getElementById('mmd-toast');
    if (!t) { t = document.createElement('div'); t.id = 'mmd-toast'; document.body.appendChild(t); }
    t.textContent = text;
    t.hidden = !text;
    clearTimeout(toast.timer);
    if (text) toast.timer = setTimeout(() => { t.hidden = true; }, 8000);
  }

  let stripFor = null;
  function teardown() {
    // a change of account: whatever was shown or started for the previous one goes
    const p = document.getElementById('mmd-panel');
    if (p) p.remove();
    const t = document.getElementById('mmd-toast');
    if (t) t.hidden = true;
    const strip = document.getElementById('mmd-links');
    if (strip) { strip.textContent = ''; strip.hidden = true; }
    stripFor = null;
    nameCache.clear();
    const bar = document.getElementById('mmd-bar');
    if (bar) bar.hidden = true;
    const sr = shadow();
    if (!sr) return;
    sr.querySelectorAll('.mmd-chips').forEach((box) => box.remove());
    sr.querySelectorAll('[data-mmd-done]').forEach((el) => el.removeAttribute('data-mmd-done'));
    sr.querySelectorAll('[data-mmd-wait]').forEach((el) => {
      ['data-mmd-wait', 'data-mmd-label', 'data-mmd-unread', 'title'].forEach((k) => el.removeAttribute(k));
    });
  }

  // ---------------------------------------------------------------- 1. linked contacts as buttons
  async function openChat(contact) {
    const epoch = await guard();
    const payload = JSON.stringify({ phoneNumber: contact.phone, contactId: contact.id });
    const bus = inboxBus();
    if (!location.hash.startsWith('#/app/inbox') || !bus) {
      try { localStorage.setItem('advancedSearch', payload); } catch (e) { /* the inbox then opens unfiltered */ }
      location.hash = '#/app/inbox/chat';
      location.reload();
      return;
    }
    toast('Buscando la conversación de ' + contact.name + '…');
    bus.$emit('advancedSearch', payload);
    let rows = [];
    for (let i = 0; i < 32; i++) {
      await sleep(250);
      stillSame(epoch);
      const now = conversationRows().filter((r) => String(r.conv.contactId) === contact.id);
      if (now.length && now.length === rows.length) break;        // two equal reads in a row: the list has settled
      rows = now;
    }
    if (!rows.length) {
      // no row of that contact identified: say what the console knows (open and closed counts), not a guess
      let counts;
      try { counts = await conversationCounts(contact.id); } catch (e) {
        toast(contact.name + ' (' + contact.phone + '): no veo su conversación en la lista y no he podido comprobar cuántas tiene (' + e.message + ').');
        return;
      }
      stillSame(epoch);
      const newest = counts.closed.newest;
      const t = newest ? (Number(newest.lastActivityAt) || Date.parse(newest.lastActivityAt)) : NaN;
      toast(noRowsMessage(contact.name, contact.phone, counts.open, counts.closed, Number.isFinite(t) && t > 0 ? clock(t) : null));
      return;
    }
    if (rows.length === 1) { await clickAndCheck(rows[0].conv.id, contact, epoch); return; }
    const p = panel('↪ ' + contact.name + ': ¿qué conversación?');
    muted(p, 'Tiene una por cada número de la empresa con el que ha hablado.');
    rows.forEach((r) => {
      const inbox = r.conv.inbox || {};
      row(p, inbox.name || inbox.phoneNumber || 'Número de la empresa', [inbox.phoneNumber, stateText(r.conv)].filter(Boolean).join(' · '),
        () => { p.remove(); clickAndCheck(r.conv.id, contact, epoch).catch((e) => toast('No he podido abrirla: ' + e.message)); });
    });
    toast('');
  }

  async function clickAndCheck(convId, contact, epoch) {
    if ((await guard()) !== epoch) throw new Error(STALE);
    const r = conversationRows().find((x) => String(x.conv.id) === String(convId) && String(x.conv.contactId) === contact.id);
    const target = r && clickable(r.el);
    if (!target) { toast('No identifico la conversación de ' + contact.name + ' en la lista: no pulso nada, ábrela tú.'); return; }
    target.click();
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      if (openConversationId() === String(convId)) { toast(''); return; }
    }
    toast('He pulsado la conversación de ' + contact.name + ', pero no confirmo que se haya abierto: revísalo.');
  }

  async function goToNumber(n) {
    // a linked number: its contact's conversation, when exactly one contact has it
    const c = await nameOf(n);
    if (!c) toast(n + ' no es un contacto en YCloud.');
    else if (c.ambiguous) toast('Hay varios contactos con el número ' + n + ': no abro ninguno. Búscalo con 🔎.');
    else await openChat(c);
  }

  async function linkChips(box, numbers, label, stillValid) {
    for (const [i, n] of numbers.entries()) {
      if (!stillValid()) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'mmd-chip';
      chip.textContent = n;
      chip.title = label + ': ' + n;
      box.appendChild(chip);
      chip.addEventListener('click', (ev) => {
        ev.stopPropagation();
        goToNumber(n).catch((e) => toast('No he podido abrirlo: ' + e.message));
      });
      if (i >= MAX_NAMES) continue;
      const c = await nameOf(n);
      if (!stillValid()) return;
      chip.textContent = !c || c.ambiguous ? n + (c ? ' (varios contactos)' : '') : c.name + ' ›';
      chip.title = label + ': ' + n + (!c ? ', no es un contacto en YCloud' : c.ambiguous ? ', varios contactos con este número'
        : ', abrir su conversación');
      if (!c || c.ambiguous) chip.style.opacity = '.6';
    }
  }

  async function refreshStrip(id) {
    // the open chat's linked contacts, next to the helper's buttons, without opening the details
    const strip = document.getElementById('mmd-links');
    if (!strip || id === stripFor) return;
    stripFor = id;
    strip.textContent = '';
    strip.hidden = true;
    if (!id) return;
    const epoch = account.epoch;
    const me = await contactGet(id);
    const attrs = (me.customAttrs || []).filter((a) => LINK_LABELS.test(a.displayName || '') && splitNumbers(a.value).length);
    const valid = () => stripFor === id && sameEpoch(epoch);
    for (const a of attrs) {
      if (!valid()) return;
      const tag = document.createElement('span');
      tag.textContent = '🔗 ' + a.displayName + ':';
      strip.appendChild(tag);
      strip.hidden = false;
      await linkChips(strip, splitNumbers(a.value), a.displayName, valid);
    }
  }

  async function enhanceLinks(current) {
    // the same buttons under «Vendedor(es)» and «Cliente(s)» in the details panel
    const sr = shadow();
    if (!sr) return;
    sr.querySelectorAll('.mmd-chips').forEach((box) => {          // React redraws the panel: drop stale buttons
      if (!box.previousElementSibling || box.dataset.contact !== current) box.remove();
    });
    const labels = [...sr.querySelectorAll('span')].filter((e) => e.children.length === 0
      && LINK_LABELS.test((e.textContent || '').trim()));
    const epoch = account.epoch;
    for (const label of labels) {
      const field = label.closest('div[class^="root-"]') || (label.parentElement && label.parentElement.parentElement
        && label.parentElement.parentElement.parentElement);
      const done = current + '|' + ((field && field.innerText) || '');
      if (!field || !current || field.dataset.mmdDone === done) continue;
      const me = await contactGet(current);
      if (!sameEpoch(epoch)) return;
      field.dataset.mmdDone = done;
      const attr = (me.customAttrs || []).find((a) => plain(a.displayName) === plain(label.textContent));
      const numbers = attr ? splitNumbers(attr.value) : [];
      const old = field.nextElementSibling && field.nextElementSibling.classList.contains('mmd-chips') ? field.nextElementSibling : null;
      if (old) old.remove();
      if (!numbers.length) continue;
      const box = document.createElement('div');
      box.className = 'mmd-chips';
      box.dataset.contact = current;
      field.after(box);
      await linkChips(box, numbers, attr.displayName, () => box.isConnected && sameEpoch(epoch));
    }
  }

  async function goToFirstLink() {
    try {
      await guard();
      const id = openContactId();
      if (!id) { toast('Abre primero una conversación.'); return; }
      const me = await contactGet(id);
      const attr = (me.customAttrs || []).find((a) => LINK_LABELS.test(a.displayName || '') && splitNumbers(a.value).length);
      if (!attr) { toast('Este contacto no tiene vendedor ni clientes anotados.'); return; }
      await goToNumber(splitNumbers(attr.value)[0]);
    } catch (e) { toast('No he podido: ' + e.message); }
  }

  // ---------------------------------------------------------------- 2. search by words or number
  async function wordSearch() {
    if (closeIfOpen(SEARCH)) return;
    try { await guard(); } catch (e) { toast(e.message); return; }
    const p = panel(SEARCH);
    const input = document.createElement('input');
    input.placeholder = 'Palabras o número, en cualquier orden: bmw madrid, 612 345';
    const filter = document.createElement('select');
    [['all', 'Todos'], ['open', 'Conversación abierta'], ['closed', 'Conversación cerrada']]
      .forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; filter.appendChild(o); });
    try { filter.value = localStorage.getItem(FILTER) || 'all'; } catch (e) { /* private window: default filter */ }
    if (!filter.value) filter.value = 'all';                       // a value kept by an older version
    const out = document.createElement('div');
    p.append(input, filter, out);
    input.focus();

    const runs = makeSearchRuns();
    async function run() {
      const me = runs.start();                                      // a newer search cancels the reads of the older one
      const signal = me.ctrl.signal;
      const plan = searchPlan(input.value);
      if (!plan.exact && !plan.words.length) { out.textContent = 'Escribe al menos una palabra o un número.'; return; }
      out.textContent = 'Buscando…';
      try {
        const epoch = await guard();
        if (!runs.isCurrent(me)) return;
        const [res, open] = await Promise.all([findContacts(plan, MAX_PAGES, signal), openConversations(10, signal)]);
        if (!runs.isCurrent(me)) return;
        const convs = new Map();
        open.list.forEach((c) => {
          const k = String(c.contactId);
          if (!convs.has(k)) convs.set(k, []);
          convs.get(k).push(c);
        });
        if (plan.pieces) {                                          // pieces of a number: among the open chats' contacts
          const known = new Set(res.found.map((c) => c.id));
          for (const [k, list] of convs) {
            const c = list[0].contact || {};
            if (!known.has(k) && hasAllWords([c.remarkName, c.nickName, c.phoneNumber].join(' '), plan.words)) {
              res.found.push({ id: k, phone: c.phoneNumber, name: displayName(c) });
              known.add(k);
            }
          }
        }
        // a filter goes by conversation: «abierta» wants one open on a number shown as connected, «cerrada» one closed
        // (another can be open); the console lists no contacts by state, so the closed ones are asked contact by contact
        const live = (id) => (convs.get(id) || []).some((conv) => conv.inbox && conv.inbox.bind === true);
        const unsure = (id) => !live(id) && (convs.get(id) || []).some((conv) => !conv.inbox || typeof conv.inbox.bind !== 'boolean');
        let shown = res.found;
        const notCounted = filter.value === 'open' ? shown.filter((c) => unsure(c.id)).length : 0;
        if (filter.value === 'open') shown = shown.filter((c) => live(c.id));
        const unchecked = filter.value === 'closed' ? Math.max(0, shown.length - 50) : 0;
        const closed = new Map();
        const ask = filter.value === 'closed' ? shown.slice(0, 50) : shown.filter((c) => !live(c.id)).slice(0, 20);
        await pool(ask, 5, async (c) => { if (runs.isCurrent(me)) closed.set(c.id, await lastClosed(c.id, signal)); });
        stillSame(epoch);
        if (!runs.isCurrent(me) || !p.isConnected) return;
        if (filter.value === 'closed') shown = shown.slice(0, 50).filter((c) => closed.get(c.id));
        const more = Math.max(0, shown.length - 50);
        shown = shown.slice(0, 50);
        out.textContent = '';
        const openCut = open.partial && (filter.value !== 'all' || plan.pieces);
        if (plan.pieces) muted(out, 'Un trozo de número lo busco solo entre las conversaciones abiertas: YCloud solo encuentra números enteros.');
        if (res.partial) muted(out, '⚠ Resultados parciales: he llegado al límite de lecturas con ' + res.cut.map((w) => '«' + w + '»').join(' y con ')
          + ' y puede faltar alguno. Añade otra palabra o usa una más concreta.');
        if (openCut) muted(out, '⚠ No he podido leer todas las conversaciones abiertas: puede faltar alguno.');
        if (notCounted) muted(out, '⚠ De ' + notCounted + ' con conversación abierta no sé si su número de empresa está conectado: no los cuento.');
        if (unchecked) muted(out, '⚠ He mirado las cerradas de los 50 primeros; quedan ' + unchecked + ' sin mirar. Añade otra palabra.');
        if (res.ambiguous) { muted(out, 'Hay varios contactos con el número ' + plan.exact + ': no elijo ninguno. Búscalos por su nombre.'); return; }
        if (!shown.length) {
          const sure = !res.partial && !openCut && !notCounted && !unchecked;
          muted(out, !sure ? 'Ninguno entre lo que he podido leer.'
            : plan.exact ? 'Ningún contacto con el número ' + plan.exact + (plan.words.length ? ' y esas palabras.' : '.')
              : 'Ningún contacto encaja.');
          return;
        }
        shown.forEach((c) => {
          const inboxOf = (conv) => (conv.inbox && conv.inbox.name ? ' (' + conv.inbox.name + ')' : '');
          const states = (convs.get(c.id) || []).map((conv) => stateText(conv) + inboxOf(conv));
          const last = closed.get(c.id);
          if (last) states.push('cerrada · último mensaje ' + clock(last.lastActivityAt) + inboxOf(last));
          else if (closed.has(c.id) && !states.length) states.push('sin conversaciones');
          row(out, c.name, [c.phone, ...states].join(' · '), () => openChat(c).catch((e) => toast('No he podido abrirla: ' + e.message)));
        });
        if (more) muted(out, 'Y ' + more + ' más: añade otra palabra.');
      } catch (e) {
        if (runs.isCurrent(me) && p.isConnected) out.textContent = 'No se pudo buscar: ' + e.message;
      }
    }

    // searching while typing (makeTyping): half a second after the last change, from three characters; a change of
    // the text cancels the search in flight and clears what was shown; Enter and a change of filter search at once
    const typing = makeTyping({ delay: 500, minChars: 3, schedule: (fn, ms) => setTimeout(fn, ms), unschedule: (id) => clearTimeout(id),
      search: () => { if (p.isConnected) run(); }, invalidate: () => { runs.cancel(); out.textContent = ''; } });
    input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') typing.enter(input.value); });
    input.addEventListener('input', () => typing.input(input.value));
    filter.addEventListener('change', () => {
      try { localStorage.setItem(FILTER, filter.value); } catch (e) { /* not kept: fine */ }
      typing.filterChanged(input.value);
    });
  }

  // ---------------------------------------------------------------- 3. waiting chats in colour
  const setAttr = (el, k, v) => { if (el.getAttribute(k) !== v) el.setAttribute(k, v); };
  function paintWaiting() {
    const sr = shadow();
    if (!sr) return;
    const now = Date.now();
    const marked = new Set();
    for (const { el, conv } of conversationRows()) {
      const w = waitState(conv, now);
      if (w.state !== 'waiting') continue;
      setAttr(el, 'data-mmd-wait', w.minutes >= WAIT.red ? 'red' : w.minutes >= WAIT.amber ? 'amber' : 'green');
      setAttr(el, 'data-mmd-label', '⏱ ' + ago(w.minutes));
      setAttr(el, 'title', 'Último mensaje del cliente: ' + clock(w.since) + (w.minutes ? ', hace ' + ago(w.minutes) : ''));
      if (conv.unreadCount > 0) setAttr(el, 'data-mmd-unread', ''); else el.removeAttribute('data-mmd-unread');
      marked.add(el);
    }
    sr.querySelectorAll('[data-mmd-wait]').forEach((el) => {
      if (marked.has(el)) return;
      ['data-mmd-wait', 'data-mmd-label', 'data-mmd-unread', 'title'].forEach((k) => el.removeAttribute(k));
    });
  }

  // ---------------------------------------------------------------- start: only in the listed accounts
  async function start() {
    // the bar, the keys and the polls are installed whatever the account is now: hidden and inert outside the listed
    // accounts, shown within TENANT_EVERY of a change to a listed one (the reviewer, 2026-11-11)
    if (!(await checkAccount()).active) console.info('[MMD] Ayudas de YCloud apagadas: esta cuenta no está en la lista.');
    const style = document.createElement('style');
    style.textContent = pageCss;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'mmd-bar';
    const strip = document.createElement('div');
    strip.id = 'mmd-links';
    strip.hidden = true;
    const buttons = document.createElement('div');
    buttons.className = 'mmd-buttons';
    [['🔎 Buscar', wordSearch, 'Alt+B']].forEach(([label, fn, key]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = key;
      b.addEventListener('click', () => { fn(); });
      buttons.appendChild(b);
    });
    bar.append(strip, buttons);
    bar.hidden = true;                                              // shown by the loop below, in a listed account's inbox
    document.body.appendChild(bar);

    document.addEventListener('keydown', (ev) => {
      if (!account.active) return;                                  // outside the listed accounts the keys are YCloud's
      const open = document.getElementById('mmd-panel');
      if (ev.key === 'Escape' && open) { open.remove(); return; }
      if (!ev.altKey) return;
      const k = ev.key.toLowerCase();
      if (k === 'b') { ev.preventDefault(); wordSearch(); }
      if (k === 'v') { ev.preventDefault(); goToFirstLink(); }
    }, true);

    setInterval(() => { checkAccount().catch(() => {}); }, TENANT_EVERY);

    let busy = false;
    let readsPausedUntil = 0;                                       // after a failed read, the next one waits a little
    setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const inbox = account.active && location.hash.startsWith('#/app/inbox');
        bar.hidden = !inbox;
        if (!inbox) return;
        placeBar(bar);
        ensureShadowStyle();
        paintWaiting();
        if (Date.now() < readsPausedUntil) return;
        const current = openContactId();
        try {
          await refreshStrip(current);
          await enhanceLinks(current);
        } catch (e) {
          stripFor = null;
          readsPausedUntil = Date.now() + 10000;
        }
      } catch (e) { /* the next tick tries again */ } finally { busy = false; }
    }, 1500);
  }

  start();
})();
