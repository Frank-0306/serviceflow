export type FaqGroup = { title: string; items: { q: string; a: string }[] };

export const faqGroups: FaqGroup[] = [
  {
    title: "Pricing and estimates",
    items: [
      {
        q: "How accurate is the online estimate?",
        a: "The estimate uses the same pricing rules we use to confirm your visit. It can change if the home's size or condition differs from what you entered; if it does, we'll tell you before any work starts.",
      },
      {
        q: "Is there a minimum charge?",
        a: "Yes. Every visit has a minimum so travel and setup are covered. The calculator applies it automatically and shows you when it does.",
      },
      {
        q: "How do recurring discounts work?",
        a: "Weekly, every-two-weeks and monthly schedules for regular and office cleaning get a lower rate on every visit. Deep and move cleans are one-time services, so they aren't discounted.",
      },
      {
        q: "When do I pay?",
        a: "After the visit is done. Requesting a service doesn't charge anything. In this demo, no payment is collected at all.",
      },
    ],
  },
  {
    title: "Booking and scheduling",
    items: [
      {
        q: "What happens after I send a request?",
        a: "We review the details, confirm the date and arrival window by email or phone, and let you know if anything about the estimate needs to change.",
      },
      {
        q: "How far ahead should I book?",
        a: "You can request any date from tomorrow onward. Weekends and the last days of the month fill first, especially for move cleans.",
      },
      {
        q: "Can I reschedule or cancel?",
        a: "Yes. Changes made at least 48 hours before the visit are free.",
      },
    ],
  },
  {
    title: "During the visit",
    items: [
      {
        q: "Do I need to be home?",
        a: "No. Many customers leave a key, lockbox code or door code. Add instructions in the access notes and we'll follow them.",
      },
      {
        q: "Do you bring your own supplies?",
        a: "Yes, including vacuums and mops. If you'd like us to use specific products, leave them out and mention it in the notes.",
      },
      {
        q: "What about pets?",
        a: "Pets are welcome. Tell us about them in your request, and add pet hair treatment if you have a shedder.",
      },
      {
        q: "What if I'm not happy with something?",
        a: "Tell us within 24 hours and we'll come back to re-clean the areas that were missed.",
      },
    ],
  },
  {
    title: "About this site",
    items: [
      {
        q: "Is BrightNest Cleaning a real company?",
        a: "No. BrightNest Cleaning is a fictional business created for the ServiceFlow portfolio project. Prices, phone numbers and email addresses are placeholders, and requests sent through this site are not fulfilled.",
      },
    ],
  },
];
