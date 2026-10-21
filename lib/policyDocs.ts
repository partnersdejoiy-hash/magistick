import { ATTENDANCE, IT_USE, SECURITY, WFH } from "./policyDocsOps";
import { CODE_OF_CONDUCT, GRIEVANCE, LEAVE, POSH } from "./policyDocsPeople";

/** One section of a full policy document: paragraphs, numbered clauses and/or a table. */
export type DocSection = {
  heading: string;
  paras?: string[];
  clauses?: string[];
  table?: { head: string[]; rows: string[][] };
};

/** Full policy text by policy slug (see lib/policies.ts for the decks). */
export const POLICY_DOCS: Record<string, DocSection[]> = {
  "code-of-conduct": CODE_OF_CONDUCT,
  "attendance-and-shifts": ATTENDANCE,
  leave: LEAVE,
  "information-security": SECURITY,
  posh: POSH,
  "work-from-home": WFH,
  "it-acceptable-use": IT_USE,
  "grievance-and-whistleblower": GRIEVANCE,
};
