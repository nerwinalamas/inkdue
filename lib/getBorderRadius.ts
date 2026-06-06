import { Position } from "@/components/bill-row";

export function getBorderRadius(position: Position) {
  switch (position) {
    case "only":
      return "rounded-2xl";
    case "first":
      return "rounded-t-2xl";
    case "last":
      return "rounded-b-2xl";
    case "middle":
      return "";
  }
}
