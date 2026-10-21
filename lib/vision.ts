import type { PhotoKey } from "./photos";
import type { IconKey } from "./policies";

/**
 * Founders' Vision content. A DRAFT written for DEJOIY's founders to edit
 * and sign: the speech is in their voice ("we"), with no invented facts
 * (no founding year, headcount or client names). Swap SIGNATURE for the
 * founders' real names once they approve the text.
 */

export const SIGNATURE = { names: "The Founders", org: "DEJOIY India Pvt. Ltd." };

export const VISION = "To be the BPO that people are proud to work at, and that clients trust with their most important customers.";

export const MISSION =
  "We help our clients look after their customers with care, accuracy and speed, by building teams that are trained well, treated fairly and given room to grow.";

/** The founders' address, paragraph by paragraph. */
export const SPEECH: string[] = [
  "Dear DEJOIY family,",
  "When we started DEJOIY, we did not set out to build just another call centre. Anyone who has spent time in this industry knows its hard side — the night shifts, the queue that never empties, the customer who is angry before you have said hello. But it has a beautiful side too: young people from every corner of India walk onto a production floor with a headset, and walk out a few years later as team leaders, trainers, managers and leaders. That transformation is the real product of a good BPO. That is what we wanted to build.",
  "Every day, someone at DEJOIY picks up a call from a person who is having a bad day. A card is blocked. A delivery is missing. A bill does not make sense. For that customer, you are not 'an agent'. You are the one person who can make the problem go away. We never want you to forget how much that matters. Our clients trust us with their customers, and their customers trust you with their time, their money and sometimes their worry.",
  "We also know that you cannot look after customers well if no one is looking after you. So we promise you the basics, done properly: rosters published on time, leave that is respected, pay that is correct, a safe ride home after a night shift, and a manager who knows your name and your goals. When we get these wrong — and sometimes we will — we want you to tell us, and we promise to listen and fix it.",
  "We care about numbers. Service levels, quality scores and handle times keep the lights on and the clients happy. But we care even more about how those numbers are earned. A number that is faked is worse than a number that is missed. We will always choose the honest miss, the honest conversation and the honest fix.",
  "Our biggest ambition is simple: that the best people in this industry choose DEJOIY, stay with DEJOIY and grow at DEJOIY. That an associate who joins us today can lead a programme tomorrow. That a client who works with us once never wants to leave. And that when your family asks where you work, you say 'DEJOIY' with pride.",
  "magistick is one small piece of that promise. It puts every app, every update, every policy and every way to get help in one place, so that you spend less time searching and more time doing work that matters. We built it for you. Use it, break it, and tell us how to make it better.",
  "Thank you for choosing DEJOIY. Let's build something we are all proud of — together.",
];

export type Value = { title: string; hindi: string; icon: IconKey; meaning: string; looksLike: string[]; photo: PhotoKey };

export const VALUES: Value[] = [
  {
    title: "People first",
    hindi: "Log pehle",
    icon: "people",
    meaning: "Our people are not a cost line. Look after them, and they look after our customers.",
    looksLike: ["Rosters on time, leave respected", "Managers who coach, not shout", "Safe travel after every night shift"],
    photo: "teamwork",
  },
  {
    title: "Every call matters",
    hindi: "Har call zaroori",
    icon: "chat",
    meaning: "Behind every ticket is a real person who needs help. Treat them the way you'd want your family treated.",
    looksLike: ["Listen fully before you solve", "Own the issue until it's closed", "Patience, even when it isn't returned"],
    photo: "support",
  },
  {
    title: "Honest numbers",
    hindi: "Imaandari",
    icon: "award",
    meaning: "We would rather miss a target honestly than hit it dishonestly. Clients trust our data because it is true.",
    looksLike: ["No released calls or closed-unresolved tickets", "Report mistakes early", "Say 'I don't know' when you don't"],
    photo: "conduct",
  },
  {
    title: "Own it",
    hindi: "Zimmedari lo",
    icon: "bulb",
    meaning: "If you see a problem, you own the first step — fix it, flag it or find the person who can.",
    looksLike: ["Raise ideas in Get Help", "Follow up without being chased", "Help the next shift succeed"],
    photo: "itUse",
  },
  {
    title: "Grow together",
    hindi: "Saath badhein",
    icon: "book",
    meaning: "Today's associate is tomorrow's team leader. We hire for potential and promote from within first.",
    looksLike: ["Internal jobs posted before external", "Trainers and SMEs from our own floor", "Every person has a growth plan"],
    photo: "celebration",
  },
  {
    title: "Keep it safe",
    hindi: "Suraksha",
    icon: "wrench",
    meaning: "Customer data, colleagues' dignity, everyone's safety — we protect them without being asked.",
    looksLike: ["Clean desk, locked screens", "Zero tolerance for harassment", "Speak up when something feels wrong"],
    photo: "security",
  },
];

export const PROMISES: { value: string; label: string }[] = [
  { value: "Friday", label: "Next week's roster, every week" },
  { value: "2 days", label: "To acknowledge any grievance" },
  { value: "Internal first", label: "Every open role posted to our people first" },
  { value: "Door-to-door", label: "Safe cab home after every night shift" },
];
