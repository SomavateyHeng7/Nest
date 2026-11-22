/**
 * Spots contact details people type to move a deal off Nest: phone numbers,
 * links, email addresses and chat handles. Used only to show a warning before
 * sending; it never blocks. Khmer digits (០-៩) are normalised first.
 */
const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";

function normaliseDigits(text: string) {
  return text.replace(/[០-៩]/g, (c) => String(KHMER_DIGITS.indexOf(c)));
}

const LINK = /(https?:\/\/|www\.|t\.me\/|wa\.me\/|line\.me\/|bit\.ly\/)\S+/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const HANDLE = /\b(telegram|whatsapp|line|wechat|viber|signal|tg|wa)\b[^\n]{0,20}[:@]?\s*@?[\w.]{4,}/i;

export function hasContactDetails(text: string): boolean {
  const t = normaliseDigits(text);
  if (LINK.test(t) || EMAIL.test(t) || HANDLE.test(t)) return true;
  // Phone numbers: 8+ digits once spaces, dots and dashes are ignored (e.g. 012 345 678, +855 12 345 678).
  const noDates = t.replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\b/g, " ");
  const phones = noDates.match(/\+?\d[\d\s().-]{6,}\d/g) ?? [];
  return phones.some((p) => p.replace(/\D/g, "").length >= 8);
}
