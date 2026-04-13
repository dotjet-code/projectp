/**
 * 使い捨てメールドメインの簡易ブロックリスト。
 * 完璧ではないが、最低限よく使われる無料ドメインを弾く。
 * 必要なら https://github.com/disposable-email-domains/disposable-email-domains
 * の list.json を取り込んで拡張する。
 */
const DISPOSABLE_DOMAINS = new Set<string>([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "sharklasers.com",
  "mailinator.com",
  "mailinator.net",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "trashmail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "throwawaymail.com",
  "fakeinbox.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "mintemail.com",
  "spambox.us",
  "spam4.me",
  "mohmal.com",
  "anonbox.net",
  "incognitomail.com",
  "mytemp.email",
  "tempmailaddress.com",
  "33mail.com",
]);

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}
