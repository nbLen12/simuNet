import type { UserProfile } from "@/types/domain";

export const DEFAULT_USER_ID = "admin_lee";

export const DEMO_USERS: Record<string, UserProfile> = {
  admin_lee: {
    id: "admin_lee",
    name: "Lee Supervisor",
    role: "ADMIN",
    scope: {
      sites: ["*"],
      explicitJobIds: []
    }
  },
  tech_ali: {
    id: "tech_ali",
    name: "Ali Technician",
    role: "TECH",
    phone: "+12025550111",
    scope: {
      sites: ["North Exchange", "Hillcrest"],
      explicitJobIds: ["JOB-2026-0002", "JOB-2026-0003"]
    }
  },
  tech_sam: {
    id: "tech_sam",
    name: "Sam Technician",
    role: "TECH",
    phone: "+12025550112",
    scope: {
      sites: ["Riverbank", "Harbor"],
      explicitJobIds: ["JOB-2026-0001"]
    }
  },
  client_maria: {
    id: "client_maria",
    name: "Maria Client Supervisor",
    role: "CLIENT",
    scope: {
      sites: ["North Exchange", "Hillcrest"],
      explicitJobIds: ["JOB-2026-0002", "JOB-2026-0003"]
    }
  }
};

export function resolveDemoUser(userId?: string): UserProfile {
  if (userId && DEMO_USERS[userId]) {
    return DEMO_USERS[userId];
  }

  return DEMO_USERS[DEFAULT_USER_ID];
}
