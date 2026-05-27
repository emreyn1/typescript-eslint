/** Single source of truth for FAQ – used on homepage section and /faq page. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "what-is",
    question: "What is GetSMSNow?",
    answer: "GetSMSNow is a service that provides temporary phone numbers for receiving SMS online. These numbers can be used for various purposes, including account verification, online registrations, and more. With GetSMSNow, you can ensure your privacy by using a disposable number instead of your personal one.",
  },
  {
    id: "how-works",
    question: "How does GetSMSNow work?",
    answer: "GetSMSNow offers temporary phone numbers from various countries that you can use to receive SMS messages online. Simply choose a number, use it to receive a verification code or message, and view the SMS directly on our platform.",
  },
  {
    id: "how-start",
    question: "How do I start using a number with GetSMSNow?",
    answer: "To use a number, visit the GetSMSNow website, top up your balance, select country, service, choose your preferred period (Activation or Rent) and press the Get Number button.",
  },
  {
    id: "specific-country",
    question: "Can I choose a number from a specific country?",
    answer: "Yes, GetSMSNow allows you to select a number from a specific country depending on availability. This feature is useful if you need a number from a particular region for your online activities.",
  },
  {
    id: "duration",
    question: "How long can I use a temporary number?",
    answer: "The duration for which you can use a temporary number depends on the period you choose. Some numbers are available for short-term use (e.g. 10 minutes for activation), while others can be rented for longer periods (hours, days, or weeks).",
  },
  {
    id: "privacy",
    question: "Is my privacy protected when using GetSMSNow?",
    answer: "Yes, GetSMSNow prioritizes your privacy. The service allows you to use temporary numbers instead of your personal phone number, reducing the risk of unwanted contacts and protecting your personal information.",
  },
];
