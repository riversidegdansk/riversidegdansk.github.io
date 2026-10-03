import { CONTACT } from '../config/site';

// Znaczniki w odpowiedziach FAQ, wypełniane danymi z src/data/settings.json (CMS → Ustawienia),
// żeby godziny i telefony w FAQ zawsze zgadzały się z resztą strony.
//   {{godziny}}             — godziny otwarcia, dzień po dniu
//   {{telefon_rezerwacje}}  — telefon do rezerwacji stolików (phone_bot)
//   {{telefon_imprezy}}     — telefon w sprawie imprez (phone_manager)
//   {{email}}               — adres e-mail
//   {{adres}}               — ulica i miasto
function tokens(html: boolean): Record<string, string> {
  const link = (href: string, label: string) => (html ? `<a href="${href}">${label}</a>` : label);
  return {
    '{{godziny}}':            CONTACT.hours.join(html ? '<br/>' : '\n'),
    '{{telefon_rezerwacje}}': link(CONTACT.phoneWorkHref, CONTACT.phoneWork),
    '{{telefon_imprezy}}':    link(CONTACT.phoneEventsHref, CONTACT.phoneEvents),
    '{{email}}':              link(CONTACT.emailHref, CONTACT.email),
    '{{adres}}':              `${CONTACT.address}, ${CONTACT.city}`,
  };
}

const fill = (answer: string, html: boolean) =>
  Object.entries(tokens(html)).reduce((text, [token, value]) => text.replaceAll(token, value), answer.trim());

/** Odpowiedź do wyświetlenia na stronie — HTML, nowe linie jako <br/>. */
export const faqAnswerHtml = (answer: string) => fill(answer, true).replace(/\n/g, '<br/>');

/** Odpowiedź jako czysty tekst — dla danych strukturalnych i llms.txt. */
export const faqAnswerText = (answer: string) => fill(answer, false).replace(/<[^>]+>/g, '');
