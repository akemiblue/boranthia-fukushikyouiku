/**
 * 大郷町社会福祉協議会　ボランティアセンター事業
 * 第1回「ボランティア楽校＆カフェ」参加申込書（Googleフォーム）
 * 申込完了メール ＋ 開催2日前のリマインドメール
 *
 * 【このスクリプトについて】
 *  すでに作ってある申込フォームに、あとから自動メールを付けるためのものです。
 *  フォームは新しく作りません（作ってしまうと二重になるため）。
 *
 * 【先にやっていただくこと　※これをしないとメールが送れません】
 *  フォームの編集画面を開き、上の「設定」タブ →「回答」→
 *  「メールアドレスを収集する」を【回答者による入力】にしてください。
 *  ※「確認済み」を選ぶと、Googleにログインしていない方は申し込めません。
 *    高齢の方も申し込まれるので、かならず【回答者による入力】を選んでください。
 *
 * 【使い方】
 *  1. フォームの編集画面で、右上の「⋮」→「拡張機能」→「Apps Script」を開く
 *  2. 出てきたコードを全部消して、このファイルの中身をすべて貼り付ける
 *  3. 左の歯車（プロジェクトの設定）で、タイムゾーンが
 *     「(GMT+09:00) 日本標準時」になっていることを確認する
 *  4. 下の CONFIG の中身（日付・会場・設問名）を確認する
 *  5. 上の関数リストで「setup」を選び、「実行」を押す
 *     → 初回は Google から許可を求められるので、許可する
 *  6. 「checkSetup」で設定状況、「sendTestMail」で文面を確認できます
 *
 *  ※ メールの送信数は、無料のGmailで1日100通までです。定員50人なら十分です。
 */

// ============================================================
// 設定（ここだけ直せば内容が変わります）
// ============================================================
const CONFIG = {
  // --- 催しのこと ---
  eventName: '第1回 大郷町の防災とボランティア活動を知る・体験する・つながる ボランティア楽校＆カフェ',
  eventShortName: 'ボランティア楽校＆カフェ',
  eventDate: '2026-12-15',           // 開催日（yyyy-MM-dd）
  eventDateText: '令和8年12月15日（火）',
  eventTimeText: '午前9時30分 〜 正午12時00分（9時00分 開場・受付開始）',
  venue: '大郷町粕川地区防災コミュニティセンター',
  venueAddress: '粕川字伝三郎34（駐車場あります）',
  capacity: 50,                       // 定員
  reminderDaysBefore: 2,             // 何日前にリマインドを送るか

  // --- 社協のこと ---
  staffEmail: 'community@oosato-syakyo.or.jp',
  orgName: '社会福祉法人 大郷町社会福祉協議会',
  centerName: '大郷町ボランティアセンター',
  tel: '022-359-2753',
  fax: '022-359-4896',
  mail: 'community@oosato-syakyo.or.jp',
  address: '宮城県黒川郡大郷町粕川字東長崎31-7',
  hours: '平日 8:30〜17:15（土日祝・年末年始を除く）',
  staffNames: '及川・千田・金須',

  // --- 設問名 ---
  // いまのフォームに合わせてあります。設問名を変えたら、ここも同じ名前に直してください。
  nameItemTitle: 'お名前',
  // 下の3つは「あれば使う」ものです。フォームになくても動きます。
  countKeyword: '人数',      // この文字を含む設問があれば、参加人数として数えます
  bonsaiKeyword: '盆栽',     // この文字を含む答えがあれば、盆栽体験の希望として数えます
  bonsaiWish: '体験',        // 盆栽の答えの中に、さらにこの文字があるものを希望とみなします
};

const TZ = 'Asia/Tokyo';

// ============================================================
// ① これ1つを実行すれば、自動メールが動き出します
// ============================================================
function setup() {
  const form = FormApp.getActiveForm();
  if (!form) {
    throw new Error(
      'フォームが見つかりません。\n' +
      'このスクリプトは、フォームの編集画面から「拡張機能 → Apps Script」で開いてください。');
  }
  removeTriggers_();
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  ScriptApp.newTrigger('checkReminder').timeBased().atHour(9).everyDays(1).create();

  Logger.log('設定しました。');
  Logger.log('・申込完了メール：申し込みが届いたときに自動で送ります');
  Logger.log('・リマインドメール：' + reminderDateText_() + ' の朝9時ごろに自動で送ります');
  Logger.log('');
  if (form.collectsEmail()) {
    Logger.log('メールアドレスの収集：オン　→　自動返信が送れます');
  } else {
    Logger.log('★★ 注意 ★★');
    Logger.log('メールアドレスの収集がオフになっています。このままでは、');
    Logger.log('申込完了メールもリマインドメールも送れません。');
    Logger.log('フォームの「設定」→「回答」→「メールアドレスを収集する」を');
    Logger.log('【回答者による入力】にしてください。');
  }
}

// ============================================================
// ② 申し込みが届いたとき
// ============================================================
function onFormSubmit(e) {
  try {
    const a = readAnswers_(e.response);
    const to = findEmail_(e.response, a);
    const name = (a.map[CONFIG.nameItemTitle] || '').trim();
    const total = countTotal_();

    // --- 申込者への控え ---
    if (to) {
      MailApp.sendEmail({
        to: to,
        subject: '【受付しました】' + CONFIG.eventShortName + '（' + CONFIG.eventDateText + '）',
        body:
          (name ? name + ' 様\n\n' : '') +
          'このたびは「' + CONFIG.eventName + '」に\n' +
          'お申し込みいただき、ありがとうございます。下記のとおり受け付けました。\n\n' +
          eventBlock_() +
          '\n【お申し込みの内容】\n' +
          '────────────────────\n' +
          a.text +
          '────────────────────\n\n' +
          '【当日について】\n' +
          '　・持ちものはとくにありません。\n' +
          '　・段ボールベッドの組み立てや、盆栽づくりの体験（希望される方）が\n' +
          '　　ありますので、動きやすく、汚れてもよい服装でお越しください。\n' +
          '　・駐車場があります。9時00分から開場しています。\n' +
          '　・お茶とお菓子をご用意しています。参加費はいただきません。\n' +
          '　・途中からのご参加、途中でお帰りになるのも大丈夫です。\n\n' +
          '開催2日前（' + reminderDateText_() + '）に、もう一度ご案内のメールをお送りします。\n' +
          'ご都合が悪くなった場合は、お手数ですがお電話でご連絡ください。\n\n' +
          '※ このメールは自動でお送りしています。ご返信いただいても担当者が確認します。\n\n' +
          signature_(),
        name: CONFIG.centerName,
        replyTo: CONFIG.staffEmail,
      });
    }

    // --- 社協への通知 ---
    let notice = '';
    if (total >= CONFIG.capacity) {
      notice = '★ 申込が定員（' + CONFIG.capacity + '人）に達しました。受付を止めるか検討してください。\n' +
               '　　止めるときは closeForm を実行してください。\n\n';
    } else if (total >= CONFIG.capacity - 5) {
      notice = '★ 定員まであと ' + (CONFIG.capacity - total) + '人です。\n\n';
    }
    const bonsai = countBonsai_();
    MailApp.sendEmail({
      to: CONFIG.staffEmail,
      subject: '【新規申込】' + CONFIG.eventShortName + '／' + (name || 'お名前なし') + '（累計 ' + total + '人）',
      body:
        notice +
        '申込フォームに新しい回答が届きました。\n' +
        '受付日時：' + Utilities.formatDate(new Date(), TZ, 'yyyy年M月d日 HH:mm') + '\n' +
        '現在の申込：' + total + '人（定員 ' + CONFIG.capacity + '人）\n' +
        (bonsai === null ? '' : '盆栽づくりの体験希望：' + bonsai + '人　← 材料の数はこれに合わせてください\n') +
        '\n────────────────────\n' +
        a.text +
        '────────────────────\n\n' +
        (to ? '申込者への控えは送信済みです（宛先：' + to + '）。\n'
            : '※ メールアドレスが取れなかったため、控えは送っていません。リマインドも届きません。\n' +
              '　 フォームの「設定」→「回答」→「メールアドレスを収集する」を確認してください。\n' +
              '　 当面は、お電話でご連絡をお願いします。\n'),
      name: '申込フォーム自動通知',
      replyTo: to || CONFIG.staffEmail,
    });

  } catch (err) {
    MailApp.sendEmail(
      CONFIG.staffEmail,
      '【要確認】' + CONFIG.eventShortName + ' 申込フォームの自動返信でエラーが出ました',
      'エラー内容：\n' + err + '\n\n回答はフォームに残っています。手動でご連絡ください。');
  }
}

// ============================================================
// ③ 2日前のリマインド（毎朝9時に自動で確認されます）
// ============================================================
function checkReminder() {
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  if (today !== reminderDate_()) return;
  sendReminder_();
}

function sendReminder_() {
  const responses = FormApp.getActiveForm().getResponses();
  const props = PropertiesService.getScriptProperties();
  const already = JSON.parse(props.getProperty('reminderSentTo') || '[]');
  let sent = 0, skipped = 0, noMail = 0;

  for (let i = 0; i < responses.length; i++) {
    const a = readAnswers_(responses[i]);
    const to = findEmail_(responses[i], a);
    const name = (a.map[CONFIG.nameItemTitle] || '').trim();

    if (!to) { noMail++; continue; }
    if (already.indexOf(to) >= 0) { skipped++; continue; }

    MailApp.sendEmail({
      to: to,
      subject: '【あさって開催】' + CONFIG.eventShortName + '（' + CONFIG.eventDateText + '）のご案内',
      body:
        (name ? name + ' 様\n\n' : '') +
        'お申し込みいただいている「' + CONFIG.eventName + '」が、\n' +
        'あさって開催となりました。お待ちしています。\n\n' +
        eventBlock_() +
        '\n【当日の流れ】\n' +
        '　 9:00　開場・受付\n' +
        '　 9:30　開会　あいさつ、本日の流れ、自己紹介\n' +
        '　10:00　講話　ボランティアとは／災害ボランティアセンターの役割と活動の流れ\n' +
        '　11:00　体験・展示・交流\n' +
        '　　　　　災害ボランティアセンターの運営体験／段ボールベッドの組み立て／\n' +
        '　　　　　最新の防災グッズ・防災バッグの展示／町内のボランティアの紹介／\n' +
        '　　　　　お茶を飲みながらの交流\n' +
        '　12:00　閉会\n\n' +
        '【お願い】\n' +
        '　・持ちものはとくにありません。動きやすく、汚れてもよい服装でお越しください。\n' +
        '　・駐車場があります。9時00分から開場しています。\n' +
        '　・途中からのご参加、途中でお帰りになるのも大丈夫です。\n' +
        '　・ご都合が悪くなった場合は、お手数ですがお電話でご連絡ください。\n' +
        '　　TEL ' + CONFIG.tel + '（' + CONFIG.hours + '）\n\n' +
        '※ このメールは自動でお送りしています。\n\n' +
        signature_(),
      name: CONFIG.centerName,
      replyTo: CONFIG.staffEmail,
    });
    already.push(to);
    sent++;
  }
  props.setProperty('reminderSentTo', JSON.stringify(already));

  MailApp.sendEmail({
    to: CONFIG.staffEmail,
    subject: '【送信しました】' + CONFIG.eventShortName + ' 2日前のリマインドメール',
    body:
      CONFIG.eventDateText + ' 開催分のリマインドメールを送りました。\n\n' +
      '　送信　　　　　　' + sent + '通\n' +
      '　送信ずみで省略　' + skipped + '通\n' +
      '　メールなし　　　' + noMail + '人　← この方々にはお電話でご連絡ください\n' +
      '　申込の合計　　　' + countTotal_() + '人（定員 ' + CONFIG.capacity + '人）\n',
    name: '申込フォーム自動通知',
  });
  Logger.log('リマインド送信：' + sent + '通／省略 ' + skipped + '通／メールなし ' + noMail + '人');
}

// ============================================================
// 手で動かすもの
// ============================================================
function sendReminderNow() { sendReminder_(); }

function closeForm() {
  const form = FormApp.getActiveForm();
  form.setAcceptingResponses(false);
  form.setCustomClosedFormMessage(
    'おかげさまで定員に達したため、申し込みの受付を終了しました。\n' +
    'ありがとうございました。次回の開催もぜひご参加ください。\n\n' +
    CONFIG.centerName + '　TEL ' + CONFIG.tel);
  Logger.log('受付を止めました。再開するときは openForm を実行してください。');
}

function openForm() {
  FormApp.getActiveForm().setAcceptingResponses(true);
  Logger.log('受付を再開しました。');
}

function checkSetup() {
  const form = FormApp.getActiveForm();
  const names = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  const bonsai = countBonsai_();

  Logger.log('■ フォーム：' + form.getTitle());
  Logger.log('　配布用URL：' + form.getPublishedUrl());
  Logger.log('　受付：' + (form.isAcceptingResponses() ? '受付中' : '停止中'));
  Logger.log('　メールアドレスの収集：' + (form.collectsEmail() ? 'オン' : '★オフ（このままでは自動メールが送れません）'));
  Logger.log('■ 申込：' + countTotal_() + '人（回答 ' + form.getResponses().length + '件／定員 ' + CONFIG.capacity + '人）');
  if (bonsai !== null) Logger.log('■ 盆栽づくりの体験希望：' + bonsai + '人');
  Logger.log('■ 申込完了メール：' + (names.indexOf('onFormSubmit') >= 0 ? '設定ずみ' : '未設定（setup を実行してください）'));
  Logger.log('■ リマインド　　：' + (names.indexOf('checkReminder') >= 0 ? '設定ずみ' : '未設定（setup を実行してください）'));
  Logger.log('　送信予定日：' + reminderDateText_() + '（開催の' + CONFIG.reminderDaysBefore + '日前）の朝9時ごろ');
  Logger.log('■ 今日：' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'));
  Logger.log('■ フォームの設問：');
  const items = form.getItems();
  for (let i = 0; i < items.length; i++) {
    Logger.log('　' + (i + 1) + '. ' + items[i].getTitle());
  }
}

function sendTestMail() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: me,
    subject: '【テスト】' + CONFIG.eventShortName + ' 申込完了メールの文面',
    body:
      '大郷 花子 様\n\n' +
      'このたびは「' + CONFIG.eventName + '」に\n' +
      'お申し込みいただき、ありがとうございます。下記のとおり受け付けました。\n\n' +
      eventBlock_() +
      '\n【お申し込みの内容】\n' +
      '────────────────────\n' +
      '■ お名前\n　大郷 花子\n\n■ ふりがな\n　おおさと はなこ\n\n' +
      '■ ご住所\n　大郷町粕川字○○\n\n■ 連絡先\n　022-000-0000\n' +
      '────────────────────\n\n' +
      signature_(),
    name: CONFIG.centerName,
  });
  Logger.log('テストメールを ' + me + ' に送りました。');
}

// ============================================================
// 補助
// ============================================================
// メールアドレスを探す。フォームの収集設定が優先、なければ設問の答えから探す。
function findEmail_(response, a) {
  let to = '';
  try { to = (response.getRespondentEmail() || '').trim(); } catch (e) { to = ''; }
  if (to) return to;
  for (const title in a.map) {
    const v = String(a.map[title] || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  }
  return '';
}

// 参加人数。「人数」を含む設問があればその数を足し、なければ1件＝1人として数える。
function countTotal_() {
  const responses = FormApp.getActiveForm().getResponses();
  let total = 0;
  for (let i = 0; i < responses.length; i++) {
    const a = readAnswers_(responses[i]);
    let extra = 0, found = false;
    for (const title in a.map) {
      if (title.indexOf(CONFIG.countKeyword) >= 0) {
        const m = String(a.map[title]).match(/(\d+)/);
        if (m) { extra = Number(m[1]); found = true; }
      }
    }
    total += found ? 1 + extra : 1;
  }
  return total;
}

// 盆栽体験の希望者数。そういう設問がなければ null を返す（表示しない）。
function countBonsai_() {
  const responses = FormApp.getActiveForm().getResponses();
  let n = 0, exists = false;
  for (let i = 0; i < responses.length; i++) {
    const a = readAnswers_(responses[i]);
    for (const title in a.map) {
      const v = String(a.map[title] || '');
      if (v.indexOf(CONFIG.bonsaiKeyword) >= 0) {
        exists = true;
        if (v.indexOf(CONFIG.bonsaiWish) >= 0) n += 1;
      }
    }
  }
  return exists ? n : null;
}

function reminderDate_() {
  const d = new Date(CONFIG.eventDate + 'T00:00:00+09:00');
  d.setDate(d.getDate() - CONFIG.reminderDaysBefore);
  return Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
}

function reminderDateText_() {
  const d = new Date(CONFIG.eventDate + 'T00:00:00+09:00');
  d.setDate(d.getDate() - CONFIG.reminderDaysBefore);
  return Utilities.formatDate(d, TZ, 'M月d日（E）');
}

function eventBlock_() {
  return '' +
    '────────────────────\n' +
    '　' + CONFIG.eventName + '\n\n' +
    '　日時　' + CONFIG.eventDateText + '\n' +
    '　　　　' + CONFIG.eventTimeText + '\n' +
    '　会場　' + CONFIG.venue + '\n' +
    '　　　　' + CONFIG.venueAddress + '\n' +
    '　参加費　無料\n' +
    '────────────────────\n';
}

function readAnswers_(response) {
  const map = {};
  const lines = [];
  const itemResponses = response.getItemResponses();
  for (let i = 0; i < itemResponses.length; i++) {
    const ir = itemResponses[i];
    const title = ir.getItem().getTitle();
    let value = ir.getResponse();
    if (Object.prototype.toString.call(value) === '[object Array]') value = value.join('、');
    value = String(value == null ? '' : value);
    map[title] = value;
    if (value.trim() !== '') {
      lines.push('■ ' + title + '\n　' + value.replace(/\n/g, '\n　') + '\n');
    }
  }
  return { map: map, text: lines.join('\n') };
}

function signature_() {
  return '' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    CONFIG.centerName + '\n' +
    '（' + CONFIG.orgName + '）\n' +
    '担当：' + CONFIG.staffNames + '\n' +
    '〒　' + CONFIG.address + '\n' +
    'TEL ' + CONFIG.tel + '　FAX ' + CONFIG.fax + '\n' +
    'MAIL ' + CONFIG.mail + '\n' +
    '受付時間 ' + CONFIG.hours + '\n' +
    '━━━━━━━━━━━━━━━━━━━━';
}

function removeTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    const fn = triggers[i].getHandlerFunction();
    if (fn === 'onFormSubmit' || fn === 'checkReminder') ScriptApp.deleteTrigger(triggers[i]);
  }
}
