export const CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: "flash-outline" },
  { id: "water", label: "Water", icon: "water-outline" },
  { id: "internet", label: "Internet", icon: "wifi-outline" },
  { id: "mobile", label: "Mobile", icon: "phone-portrait-outline" },
  { id: "rent", label: "Rent", icon: "home-outline" },
  { id: "other", label: "Other", icon: "receipt-outline" },
];

export const CATEGORY_ICONS: Record<string, any> = {
  electricity: "flash-outline",
  water: "water-outline",
  internet: "wifi-outline",
  mobile: "phone-portrait-outline",
  rent: "home-outline",
  other: "receipt-outline",
};

export const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  electricity: { bg: "bg-yellow-50", icon: "#F59E0B" },
  water: { bg: "bg-blue-50", icon: "#3B82F6" },
  internet: { bg: "bg-purple-50", icon: "#8B5CF6" },
  mobile: { bg: "bg-green-50", icon: "#10B981" },
  rent: { bg: "bg-orange-50", icon: "#F97316" },
  other: { bg: "bg-gray-100", icon: "#6B7280" },
};
