// Helper to fetch company settings from Firestore with fallback defaults
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, SETTINGS_DOC_ID, type CompanySettings } from "@/lib/firestore-types";

export const defaultCompanySettings: CompanySettings = {
  email: "hello@corexit.com",
  phone: "+94 11 234 5678",
  address: "Colombo, Sri Lanka",
  facebook: "https://facebook.com/your-page",
  github: "https://github.com/your-profile",
  tiktok: "https://tiktok.com/@your-profile",
  linkedin: "https://linkedin.com/company/your-company",
};

export async function fetchCompanySettings(): Promise<CompanySettings> {
  try {
    const ref = doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Partial<CompanySettings>;
      return { ...defaultCompanySettings, ...data } as CompanySettings;
    }
  } catch {
    // fallback to defaults for public visitors
  }
  return defaultCompanySettings;
}
