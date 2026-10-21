import type { PhotoKey } from "./photos";
import type { IconKey } from "./policies";

/**
 * Founders' Vision content. The founder's name, title, photo and quote come
 * from DEJOIY's own site (dejoiy-site/pages/our-people.js). The address is a
 * DRAFT in her voice for her to edit and approve: it states no invented
 * facts (no founding year, headcount or client names).
 */

export const FOUNDER = {
  name: "Jyoti Sharma",
  title: "Founder & Director",
  org: "DEJOIY India Pvt. Ltd.",
  photo: "/founders/jyoti-sharma.webp",
  quote: "Execution excellence is our unfair advantage.",
};

/** What the name means: "De" (दे, to give) + "Joy". */
export const NAME_MEANING = {
  headline: "DEJOIY means “to give joy”.",
  parts: [
    { part: "De", script: "दे", text: "Hindi for “give”. We exist to give — service to customers, results to clients, opportunity to our people." },
    { part: "Joi", script: "जॉय", text: "Joy. The feeling a customer has when the problem is finally solved, and the pride a team feels when the shift goes well." },
    { part: "Y", script: "य", text: "You. Joy doesn't happen by itself. It starts with each one of us, on every call and every shift." },
  ],
};

export const VISION = "To be the BPO that people are proud to work at, and that clients trust with their most important customers.";

export const MISSION =
  "We help our clients look after their customers with care, accuracy and speed, by building teams that are trained well, treated fairly and given room to grow.";

export type LetterValue = {
  letter: string;
  title: string;
  hindi: string;
  icon: IconKey;
  meaning: string;
  looksLike: string[];
  photo: PhotoKey;
  color: string;
};

/** The six core values, one for each letter of D-E-J-O-I-Y. */
export const LETTERS: LetterValue[] = [
  {
    letter: "D",
    title: "Dil se seva",
    hindi: "Serve from the heart",
    icon: "chat",
    meaning: "Behind every ticket is a real person having a bad day. We serve them the way we'd want our own family served.",
    looksLike: ["Listen fully before you solve", "Own the issue until it's closed", "Patience, even when it isn't returned"],
    photo: "support",
    color: "#E91E63",
  },
  {
    letter: "E",
    title: "Execution excellence",
    hindi: "Kaam mein kamaal",
    icon: "gauge",
    meaning: "Doing the basics brilliantly, every single shift, is what clients remember. Precision is our unfair advantage.",
    looksLike: ["Follow the process, every time", "Quality checked before it's shipped", "Hand-offs agreed before go-live"],
    photo: "attendance",
    color: "#F59E0B",
  },
  {
    letter: "J",
    title: "Joy for our people",
    hindi: "Log pehle",
    icon: "people",
    meaning: "Happy, respected people give the best service. Looking after our team is how we look after customers.",
    looksLike: ["Rosters on time, leave respected", "Managers who coach, not shout", "Safe travel after every night shift"],
    photo: "celebration",
    color: "#14B8A6",
  },
  {
    letter: "O",
    title: "Ownership",
    hindi: "Zimmedari",
    icon: "bulb",
    meaning: "If you see a problem, you own the first step: fix it, flag it, or find the person who can.",
    looksLike: ["A named owner for every queue", "Follow up without being chased", "Help the next shift succeed"],
    photo: "teamwork",
    color: "#3B82F6",
  },
  {
    letter: "I",
    title: "Integrity",
    hindi: "Imaandari",
    icon: "award",
    meaning: "Honest numbers, safe data, dignity for everyone. We'd rather miss a target honestly than hit it dishonestly.",
    looksLike: ["No released calls or faked scores", "Clean desk, locked screens", "Zero tolerance for harassment"],
    photo: "security",
    color: "#A855F7",
  },
  {
    letter: "Y",
    title: "Yours to grow",
    hindi: "Saath badhein",
    icon: "book",
    meaning: "Today's associate is tomorrow's team leader. We hire for potential and promote from within first.",
    looksLike: ["Internal roles posted first", "Trainers and SMEs from our own floor", "A growth plan for every person"],
    photo: "leave",
    color: "#10B981",
  },
];

/** The founder's address, paragraph by paragraph. First item is the salutation, last is the closing line. */
export const SPEECH: string[] = [
  "Dear DEJOIY family,",
  "When I started DEJOIY, I did not want to build just another call centre. Anyone who has spent time in this industry knows its hard side — the night shifts, the queue that never empties, the customer who is angry before you have said hello. But it has a beautiful side too: young people from every corner of India walk onto a production floor with a headset, and a few years later walk out as team leaders, trainers, managers and leaders. That transformation is the real product of a good BPO. That is what I wanted to build.",
  "Our name says what we are here for. DEJOIY means to give joy — to the customer whose problem finally gets solved, to the client who can rely on us, and to every one of you who chooses to build a career here. Joy is not a soft word for me. It is the result of hard, precise, honest work done well.",
  "Every day, someone at DEJOIY picks up a call from a person who is having a bad day. A card is blocked. A delivery is missing. A bill does not make sense. For that customer, you are not ‘an agent’. You are the one person who can make the problem go away. Please never forget how much that matters.",
  "I often say that execution excellence is our unfair advantage. Big promises are easy; doing the basics brilliantly, shift after shift, is rare. That is where we will win — in the discipline of a clean hand-off, an accurate note, a quality check done properly.",
  "I also know that you cannot look after customers well if no one is looking after you. So I promise you the basics, done properly: rosters published on time, leave that is respected, pay that is correct, a safe ride home after a night shift, and a manager who knows your name and your goals. When we get these wrong — and sometimes we will — tell me, and we will fix it.",
  "We care about numbers, but we care even more about how they are earned. A number that is faked is worse than a number that is missed. At DEJOIY we will always choose the honest miss, the honest conversation and the honest fix.",
  "My biggest dream is simple: that the best people in this industry choose DEJOIY, stay with DEJOIY and grow at DEJOIY. That when your family asks where you work, you say ‘DEJOIY’ with pride. magistick is one small step towards that — one place for every app, update, policy and way to get help. We built it for you. Use it, and tell us how to make it better.",
  "Thank you for choosing DEJOIY. Let's give joy — together.",
];

export const PROMISES: { value: string; label: string }[] = [
  { value: "Friday", label: "Next week's roster, every week" },
  { value: "2 days", label: "To acknowledge any grievance" },
  { value: "Internal first", label: "Every open role posted to our people first" },
  { value: "Door-to-door", label: "Safe cab home after every night shift" },
];
