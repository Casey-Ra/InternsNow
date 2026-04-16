export type CommunityFeedListEntry = {
  url: string;
  label: string;
};

// Primary editable source for community feeds.
// Update this list to add/remove feed sources.
export const COMMUNITY_FEED_LIST: CommunityFeedListEntry[] = [
  {
    url: "https://patch.com/connecticut/stamford/calendar",
    label: "Stamford Patch",
  },
  {
    url: "https://patch.com/connecticut/norwalk/calendar",
    label: "Norwalk Patch",
  },
  {
    url: "https://patch.com/connecticut/greenwich/calendar",
    label: "Greenwich Patch",
  },
  {
    url: "https://patch.com/connecticut/westport/calendar",
    label: "Westport Patch",
  },
  {
    url: "https://events.uconn.edu/",
    label: "UConn Events",
  },
];
