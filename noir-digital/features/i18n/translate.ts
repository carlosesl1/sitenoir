import english from "./en.json";
import cases from "./en-cases.json";
import details from "./en-details.json";
import legal from "./en-legal.json";

export type Language = "pt" | "en";

const translations: Readonly<Record<string, string>> = {
  ...english,
  ...cases,
  ...legal,
  ...details,
};

export function translate(text: string, language: Language): string {
  return language === "en" ? (translations[text] ?? text) : text;
}
