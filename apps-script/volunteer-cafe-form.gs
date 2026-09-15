/**
 * 大郷町社会福祉協議会　ボランティアセンター事業
 * 第1回 大郷町の防災とボランティア活動を考える「ボランティアカフェ」
 * 申込フォームの自動作成 ＋ 申込完了メール ＋ 2日前リマインドメール
 *
 * 【使い方】
 *  1. script.google.com を開き、「新しいプロジェクト」をクリック
 *  2. 表示されたコードを全部消して、このファイルの中身をすべて貼り付ける
 *  3. 左の歯車（プロジェクトの設定）で、タイムゾーンが
 *     「(GMT+09:00) 日本標準時」になっていることを確認する
 *  4. 下の CONFIG の中身（日付・会場・メールアドレス）を確認する
 *  5. 上の関数リストで「createForm」を選び、「実行」を押す
 *     → 初回は Google から許可を求められるので、許可する
 *     → 実行ログにフォームのURLが出るので、それでQRコードを作る
 *  6. つづけて「setupTriggers」を実行する
 *     → これで「申込完了メール」と「2日前リマインド」が自動で動きます
 *  7. 「checkSetup」を実行すると、いまの設定状況が確認できます
 *
 *  ※ createForm は一度だけ。もう一度実行すると別のフォームが新しく作られます。
 *  ※ メールの送信数には上限があります（無料のGmailは1日100通まで）。
 *    定員50人なら問題ありませんが、それを超える場合はご注意ください。
 */

// ============================================================
// 設定（ここだけ直せば内容が変わります）
// ============================================================
const CONFIG = {
  // --- 催しのこと ---
  eventName: '第1回 大郷町の防災とボランティア活動を考える ボランティアカフェ',
  eventShortName: 'ボランティアカフェ',
  eventDate: '2026-12-15',           // 開催日（yyyy-MM-dd）
  eventDateText: '令和8年12月15日（火）',
  eventTimeText: '午前9時30分 〜 正午12時00分（9時00分 開場・受付開始）',
  venue: '粕川地区防災コミュニティーセンター',
  venueAddress: '大郷町粕川字伝三郎34（駐車場あります）',
  capacity: 50,                       // 定員
  deadline: '2026-12-08',            // 申込の締切（yyyy-MM-dd）
  deadlineText: '12月8日（月）',
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

  // --- 設問名（設問名を変えたら、ここも同じ名前に直してください） ---
  nameItemTitle: 'お名前',
  kanaItemTitle: 'ふりがな',
  emailItemTitle: 'メールアドレス',
  telItemTitle: '電話番号',
  countItemTitle: '一緒に参加される方の人数',
};

const TZ = 'Asia/Tokyo';

// ============================================================
// ① フォームを作る（最初に1回だけ実行）
// ============================================================
function createForm() {
  const form = FormApp.create('【申込】' + CONFIG.eventName);

  form.setDescription(
    CONFIG.eventDateText + '　' + CONFIG.eventTimeText + '\n' +
    CONFIG.venue + '（' + CONFIG.venueAddress + '）\n' +
    '定員 ' + CONFIG.capacity + '人　参加費 無料　どなたでも参加できます\n\n' +
    '災害ボランティアセンターの運営体験、段ボールベッドの組み立て、最新の防災グッズの展示、\n' +
    '町内で活動しているボランティアの紹介など、見て・さわって・話せる時間です。\n' +
    'お茶を飲みながらの交流もあります。はじめての方も、どうぞお気軽にお越しください。\n\n' +
    '申込の締切　' + CONFIG.deadlineText + '（定員になり次第、締め切ります）\n' +
    'お電話でもお申し込みいただけます。　TEL ' + CONFIG.tel + '（' + CONFIG.hours + '）'
  );

  form.setConfirmationMessage(
    'お申し込みありがとうございます。受け付けました。\n' +
    'メールアドレスをご記入いただいた方には、控えのメールをお送りしています。\n' +
    '開催2日前にも、あらためてご案内のメールをお送りします。\n\n' +
    CONFIG.eventDateText + '　' + CONFIG.venue + 'でお待ちしています。\n' +
    CONFIG.centerName + '　TEL ' + CONFIG.tel
  );

  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);

  form.addTextItem()
    .setTitle(CONFIG.nameItemTitle)
    .setHelpText('例：大郷 花子')
    .setRequired(true);

  form.addTextItem()
    .setTitle(CONFIG.kanaItemTitle)
    .setHelpText('例：おおさと はなこ');

  form.addTextItem()
    .setTitle('お住まいの地区')
    .setHelpText('例：粕川、中村、味明　など');

  form.addTextItem()
    .setTitle(CONFIG.telItemTitle)
    .setHelpText('当日ご連絡がつく番号をお願いします')
    .setRequired(true);

  form.addTextItem()
    .setTitle(CONFIG.emailItemTitle)
    .setHelpText(
      'お申し込みの控えと、開催2日前のご案内をお送りします。\n' +
      'お持ちでない場合は空欄で構いません（お電話でご連絡します）。'
    );

  form.addListItem()
    .setTitle(CONFIG.countItemTitle)
    .setHelpText('ご本人以外に一緒に来られる方の人数です')
    .setChoiceValues(['0人（本人のみ）', '1人', '2人', '3人', '4人以上'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('当日、やってみたいこと（いくつでも／決まっていなくても大丈夫です）')
    .setChoiceValues([
      '災害ボランティアセンターの運営体験',
      '段ボールベッドの組み立て',
      '最新の防災グッズ・防災バッグの中身を見る',
      '盆栽ボランティアの紹介を見る',
      '配食ボランティアの紹介を見る',
      'お茶を飲みながら交流したい',
      'ボランティア活動の相談をしたい',
    ]);

  form.addParagraphTextItem()
    .setTitle('体調や移動のことで、配慮が必要なことはありますか')
    .setHelpText('段差、いすの用意、車いす、送迎など。書いていただければ、できる範囲で準備します。');

  form.addParagraphTextItem()
    .setTitle('社協へのご質問・ひとこと');

  Logger.log('フォームができました。');
  Logger.log('■ 配布用URL（QRコードはこのURLで作ります）');
  Logger.log(form.getShortUrl());
  Logger.log('■ 編集用URL（社協が中身を直すとき）');
  Logger.log(form.getEditUrl());
  Logger.log('つづけて setupTriggers を実行してください。');
  return form.getShortUrl();
}

// ============================================================
// ② 自動化の設定（createForm のあとに1回だけ実行）
// ============================================================
function setupTriggers() {
  const form = findForm_();
  removeTriggers_();

  // 申し込みが届いたとき
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();

  // 毎朝9時に「今日はリマインドを送る日か」を確認する
  ScriptApp.newTrigger('checkReminder').timeBased().atHour(9).everyDays(1).create();

  Logger.log('設定しました。');
  Logger.log('・申込完了メール：申し込みが届いたときに自動で送ります');
  Logger.log('・リマインドメール：' + reminderDateText_() + ' の朝9時ごろに自動で送ります');
}

// ============================================================
// ③ 申し込みが届いたとき
// ============================================================
function onFormSubmit(e) {
  try {
    const a = readAnswers_(e);
    const to = (a.map[CONFIG.emailItemTitle] || '').trim();
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
          '　・段ボールベッドの組み立てや盆栽の体験がありますので、\n' +
          '　　動きやすく、汚れてもよい服装でお越しください。\n' +
          '　・駐車場があります。9時00分から開場しています。\n' +
          '　・お茶とお菓子をご用意しています。参加費はいただきません。\n\n' +
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
      notice = '★ 申込が定員（' + CONFIG.capacity + '人）に達しました。フォームの受付を止めるか検討してください。\n' +
               '　　止めるときは closeForm を実行してください。\n\n';
    } else if (total >= CONFIG.capacity - 5) {
      notice = '★ 定員まであと ' + (CONFIG.capacity - total) + '人です。\n\n';
    }
    MailApp.sendEmail({
      to: CONFIG.staffEmail,
      subject: '【新規申込】' + CONFIG.eventShortName + '／' + (name || 'お名前なし') + '（累計 ' + total + '人）',
      body:
        notice +
        '申込フォームに新しい回答が届きました。\n' +
        '受付日時：' + Utilities.formatDate(new Date(), TZ, 'yyyy年M月d日 HH:mm') + '\n' +
        '現在の申込人数：' + total + '人（定員 ' + CONFIG.capacity + '人）\n\n' +
        '────────────────────\n' +
        a.text +
        '────────────────────\n\n' +
        (to ? '申込者への控えは送信済みです（宛先：' + to + '）。\n'
            : '※ メールアドレスの記入がなかったため、控えは送っていません。リマインドも届きません。お電話でご連絡ください。\n'),
      name: '申込フォーム自動通知',
      replyTo: to || CONFIG.staffEmail,
    });

  } catch (err) {
    MailApp.sendEmail(
      CONFIG.staffEmail,
      '【要確認】' + CONFIG.eventShortName + ' 申込フォームの自動返信でエラーが出ました',
      'エラー内容：\n' + err + '\n\n回答はフォームに残っています。手動でご連絡ください。'
    );
  }
}

// ============================================================
// ④ 2日前のリマインド（毎朝9時に自動で確認されます）
// ============================================================
function checkReminder() {
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  if (today !== reminderDate_()) return;   // 送る日でなければ何もしない
  sendReminder_();
}

function sendReminder_() {
  const form = findForm_();
  const responses = form.getResponses();
  const props = PropertiesService.getScriptProperties();
  const already = JSON.parse(props.getProperty('reminderSentTo') || '[]');

  let sent = 0, skipped = 0, noMail = 0;

  for (let i = 0; i < responses.length; i++) {
    const a = readAnswersFromResponse_(responses[i]);
    const to = (a.map[CONFIG.emailItemTitle] || '').trim();
    const name = (a.map[CONFIG.nameItemTitle] || '').trim();

    if (!to) { noMail++; continue; }
    if (already.indexOf(to) >= 0) { skipped++; continue; }   // 二重送信をふせぐ

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
        '　10:00　講座　ボランティアとは／災害ボランティアセンターの役割と活動の流れ\n' +
        '　11:00　体験・交流\n' +
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
      '　メール未記入　　' + noMail + '人　← この方々にはお電話でご連絡ください\n' +
      '　申込の合計　　　' + countTotal_() + '人（定員 ' + CONFIG.capacity + '人）\n',
    name: '申込フォーム自動通知',
  });

  Logger.log('リマインド送信：' + sent + '通／省略 ' + skipped + '通／メール未記入 ' + noMail + '人');
}

// ============================================================
// 手で動かすもの
// ============================================================

// リマインドを今すぐ送る（日付を待たずに送りたいとき）
function sendReminderNow() {
  sendReminder_();
}

// 申込の受付を止める（定員に達したとき・締切をすぎたとき）
function closeForm() {
  const form = findForm_();
  form.setAcceptingResponses(false);
  form.setCustomClosedFormMessage(
    'おかげさまで定員に達したため、申し込みの受付を終了しました。\n' +
    'ありがとうございました。次回の開催もぜひご参加ください。\n\n' +
    CONFIG.centerName + '　TEL ' + CONFIG.tel
  );
  Logger.log('受付を止めました。再開するときは openForm を実行してください。');
}

function openForm() {
  findForm_().setAcceptingResponses(true);
  Logger.log('受付を再開しました。');
}

// いまの状況を見る
function checkSetup() {
  const form = findForm_();
  const triggers = ScriptApp.getProjectTriggers();
  const names = triggers.map(function (t) { return t.getHandlerFunction(); });

  Logger.log('■ フォーム：' + form.getTitle());
  Logger.log('　配布用URL：' + form.getShortUrl());
  Logger.log('　受付：' + (form.isAcceptingResponses() ? '受付中' : '停止中'));
  Logger.log('■ 申込人数：' + countTotal_() + '人（回答 ' + form.getResponses().length + '件／定員 ' + CONFIG.capacity + '人）');
  Logger.log('■ 申込完了メール：' + (names.indexOf('onFormSubmit') >= 0 ? '設定ずみ' : '未設定（setupTriggers を実行してください）'));
  Logger.log('■ リマインド　　：' + (names.indexOf('checkReminder') >= 0 ? '設定ずみ' : '未設定（setupTriggers を実行してください）'));
  Logger.log('　送信予定日：' + reminderDateText_() + '（開催の' + CONFIG.reminderDaysBefore + '日前）の朝9時ごろ');
  Logger.log('■ 今日：' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'));
}

// 文面を自分あてに送って確かめる
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
      '■ お名前\n　大郷 花子\n\n■ 電話番号\n　022-000-0000\n\n' +
      '■ 一緒に参加される方の人数\n　1人\n\n' +
      '■ 当日、やってみたいこと\n　段ボールベッドの組み立て、お茶を飲みながら交流したい\n' +
      '────────────────────\n\n' +
      signature_(),
    name: CONFIG.centerName,
  });
  Logger.log('テストメールを ' + me + ' に送りました。');
}

// ============================================================
// 補助
// ============================================================
function findForm_() {
  // スクリプトがフォームに紐づいている場合はそれを、そうでなければ保存したIDを使う
  const active = FormApp.getActiveForm();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty('formId');
  if (id) return FormApp.openById(id);
  throw new Error('フォームが見つかりません。createForm を実行するか、スクリプトのプロパティ formId にフォームIDを入れてください。');
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

// 申込の合計人数（本人＋同伴者）
function countTotal_() {
  const responses = findForm_().getResponses();
  let total = 0;
  for (let i = 0; i < responses.length; i++) {
    const a = readAnswersFromResponse_(responses[i]);
    const v = String(a.map[CONFIG.countItemTitle] || '');
    const m = v.match(/(\d+)/);
    total += 1 + (m ? Number(m[1]) : 0);
  }
  return total;
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

function readAnswers_(e) {
  return readAnswersFromResponse_(e.response);
}

function readAnswersFromResponse_(response) {
  const map = {};
  const lines = [];
  const itemResponses = response.getItemResponses();
  for (let i = 0; i < itemResponses.length; i++) {
    const ir = itemResponses[i];
    const title = ir.getItem().getTitle();
    let value = ir.getResponse();
    if (Object.prototype.toString.call(value) === '[object Array]') {
      value = value.join('、');
    }
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
    if (fn === 'onFormSubmit' || fn === 'checkReminder') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
