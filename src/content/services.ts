import type { ServiceId } from "@/config/pricing";

export type RoomChecklist = { room: string; tasks: string[] };

export type Service = {
  id: ServiceId;
  slug: string;
  name: string;
  /** One line used in lists and meta descriptions. */
  summary: string;
  /** Opening paragraph on the service page. */
  intro: string;
  bestFor: string[];
  checklist: RoomChecklist[];
  notIncluded: string[];
  preparation: string[];
  photo: { alt: string; brief: string };
  questions: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    id: "regular",
    slug: "regular-cleaning",
    name: "Regular cleaning",
    summary: "Routine upkeep on a weekly, every-two-weeks or monthly schedule, so the house never gets away from you.",
    intro:
      "A regular clean keeps the rooms you use every day in good order: kitchen counters wiped down, bathrooms disinfected, floors vacuumed and mopped, beds made. Book it once or set a schedule and save on every visit.",
    bestFor: [
      "Busy households that want weekends back",
      "Homes that are already in good shape",
      "Keeping things steady between deep cleans",
    ],
    checklist: [
      {
        room: "Kitchen",
        tasks: [
          "Counters, backsplash and sink cleaned",
          "Stovetop and exterior of appliances wiped",
          "Microwave cleaned inside and out",
          "Trash emptied and liner replaced",
        ],
      },
      {
        room: "Bathrooms",
        tasks: [
          "Toilet, tub and shower scrubbed and disinfected",
          "Mirrors and fixtures polished",
          "Vanity and sink cleaned",
          "Floors mopped",
        ],
      },
      {
        room: "Bedrooms and living areas",
        tasks: [
          "Reachable surfaces dusted",
          "Beds made, linens changed if left out",
          "Floors vacuumed, hard floors mopped",
          "Light tidying of surfaces",
        ],
      },
    ],
    notIncluded: [
      "Inside the oven, fridge or cabinets (available as add-ons)",
      "Baseboards and door frames detail work",
      "Moving heavy furniture",
    ],
    preparation: [
      "Clear counters and floors of personal items where you can.",
      "Leave fresh linens on the bed if you'd like them changed.",
      "Let us know about pets and how to get in.",
    ],
    photo: {
      alt: "Placeholder for a photo of a tidy kitchen counter in morning light",
      brief: "Tidy kitchen counter, morning light",
    },
    questions: [
      {
        q: "Will I get the same cleaner each visit?",
        a: "For recurring schedules we aim to send the same person or pair each time, so they learn how you like things done. In this demo, scheduling is illustrative.",
      },
      {
        q: "Can I skip or move a visit?",
        a: "Yes. Change or skip a recurring visit with at least 48 hours' notice at no charge.",
      },
    ],
  },
  {
    id: "deep",
    slug: "deep-cleaning",
    name: "Deep cleaning",
    summary: "A top-to-bottom clean for buildup, first visits and seasonal resets, including the details a regular clean skips.",
    intro:
      "A deep clean covers everything in a regular visit, then goes after what builds up over months: baseboards, door frames, grout, light switches, vents and the grime behind the faucet. Most recurring customers start here.",
    bestFor: [
      "A first visit before a recurring schedule",
      "Spring cleaning or getting ready for guests",
      "Homes that haven't had a professional clean in a while",
    ],
    checklist: [
      {
        room: "Kitchen",
        tasks: [
          "Everything in a regular clean",
          "Cabinet fronts and handles degreased",
          "Backsplash grout scrubbed",
          "Range hood and filter wiped",
        ],
      },
      {
        room: "Bathrooms",
        tasks: [
          "Everything in a regular clean",
          "Tile grout and caulk lines scrubbed",
          "Soap scum and hard-water stains treated",
          "Exhaust fan cover dusted",
        ],
      },
      {
        room: "Throughout the home",
        tasks: [
          "Baseboards, door frames and doors wiped",
          "Light switches and outlet covers cleaned",
          "Window sills and tracks vacuumed",
          "Vents and ceiling fan blades dusted",
        ],
      },
    ],
    notIncluded: [
      "Exterior windows",
      "Carpet shampooing or upholstery cleaning",
      "Mold remediation or biohazard cleanup",
    ],
    preparation: [
      "Put away valuables and anything fragile you'd rather we didn't handle.",
      "Make sure hot water and power are on.",
      "Plan for the visit to take most of a morning or afternoon.",
    ],
    photo: {
      alt: "Placeholder for a close-up photo of clean bathroom tile and grout",
      brief: "Bathroom tile detail, clean grout lines",
    },
    questions: [
      {
        q: "How is a deep clean different from a regular clean?",
        a: "A regular clean maintains surfaces you see every day. A deep clean adds the detail work, like baseboards, grout, vents and door frames, and usually takes about twice as long.",
      },
      {
        q: "Why does the condition of my home change the price?",
        a: "Heavier buildup takes longer to remove. Choosing the right condition up front keeps your estimate close to the final price.",
      },
    ],
  },
  {
    id: "move",
    slug: "move-in-move-out-cleaning",
    name: "Move-in / move-out cleaning",
    summary: "An empty-home clean for tenants, buyers and landlords, inside cabinets and appliances included.",
    intro:
      "When the rooms are empty, every surface is reachable. A move clean includes the full deep-clean checklist plus the inside of cabinets, drawers, closets and appliances, so the next people walk into a home that's ready to use.",
    bestFor: [
      "Tenants hoping to get their deposit back",
      "Buyers who want a fresh start before unpacking",
      "Landlords and property managers between leases",
    ],
    checklist: [
      {
        room: "Kitchen",
        tasks: [
          "Inside cabinets and drawers wiped",
          "Inside the oven and fridge cleaned",
          "Dishwasher filter and door seal cleaned",
          "Sink and fixtures descaled",
        ],
      },
      {
        room: "Bathrooms",
        tasks: [
          "Full deep-clean bathroom checklist",
          "Inside vanities and medicine cabinets",
          "Toilet base and behind the toilet",
          "Shower door tracks cleaned",
        ],
      },
      {
        room: "Every room",
        tasks: [
          "Closets, shelves and rods wiped",
          "Baseboards, doors and frames cleaned",
          "Interior window sills and tracks",
          "Floors vacuumed and mopped edge to edge",
        ],
      },
    ],
    notIncluded: [
      "Removing furniture, trash or items left behind",
      "Wall painting or patching",
      "Exterior windows, garages and patios",
    ],
    preparation: [
      "Book after the movers are done and the home is empty.",
      "Keep utilities on through the visit.",
      "Share lockbox or key details in the access notes.",
    ],
    photo: {
      alt: "Placeholder for a photo of an empty, sunlit living room with wood floors",
      brief: "Empty living room, sunlit wood floors",
    },
    questions: [
      {
        q: "Do you guarantee I'll get my deposit back?",
        a: "No cleaning company can promise that; deposits depend on your lease and the landlord. We follow a checklist built around common move-out inspection items.",
      },
      {
        q: "Should I book before or after moving day?",
        a: "After the home is empty. Furniture and boxes block the areas a move clean is meant to reach.",
      },
    ],
  },
  {
    id: "office",
    slug: "office-cleaning",
    name: "Office cleaning",
    summary: "After-hours cleaning for small offices and studios, priced by square footage and restrooms.",
    intro:
      "Small offices need the same care as a home, on a schedule that doesn't interrupt work. We clean desks, kitchens, restrooms and floors after hours or before you open, weekly or more often.",
    bestFor: [
      "Offices and studios up to about 10,000 sq ft",
      "Teams that want cleaning outside business hours",
      "Shared kitchens and break rooms",
    ],
    checklist: [
      {
        room: "Workspaces",
        tasks: [
          "Desks and shared surfaces wiped where clear",
          "Phones, keyboards and door handles disinfected",
          "Trash and recycling emptied",
          "Floors vacuumed and mopped",
        ],
      },
      {
        room: "Kitchen and break room",
        tasks: [
          "Counters, sink and tables cleaned",
          "Microwave and appliance exteriors wiped",
          "Dishes loaded into the dishwasher",
        ],
      },
      {
        room: "Restrooms",
        tasks: [
          "Toilets, sinks and fixtures disinfected",
          "Mirrors polished",
          "Supplies restocked from your inventory",
          "Floors mopped",
        ],
      },
    ],
    notIncluded: [
      "Medical, laboratory or industrial spaces",
      "Floor stripping and waxing",
      "IT equipment interiors",
    ],
    preparation: [
      "Tell us your alarm and access procedure.",
      "Clear desks of papers you don't want moved.",
      "Show us where supplies are kept.",
    ],
    photo: {
      alt: "Placeholder for a photo of a quiet small office after hours",
      brief: "Small office after hours, desks clear",
    },
    questions: [
      {
        q: "Can you clean outside business hours?",
        a: "Yes. Most office visits happen early morning or evening. Add your preferred time in the access notes when you request service.",
      },
      {
        q: "Do you bring supplies?",
        a: "We bring cleaning products and equipment. Paper goods and soap refills come from your own stock.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getServiceById(id: ServiceId): Service {
  const service = services.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}
