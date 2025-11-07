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
  queries: {
    all: () => ["queries"] as const,
    detail: (id: string) => ["queries", id] as const,
    results: (id: string) => ["queries", id, "results"] as const,
    filterOptions: () => ["queries", "filter-options"] as const,
  },
} as const
