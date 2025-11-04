export const queryKeys = {
  credentials: {
    all: () => ["credentials"] as const,
  },
  categories: {
    all: () => ["categories"] as const,
    detail: (id: string) => ["categories", id] as const,
  },
  locations: {
    all: () => ["locations"] as const,
    detail: (id: string) => ["locations", id] as const,
  },
  dorks: {
    all: () => ["dorks"] as const,
    detail: (id: string) => ["dorks", id] as const,
  },
} as const
