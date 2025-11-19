import { formatRelativeDate } from "@/lib/helpers";

export const RelativeTime = ({ date }: { date: Date | string }) => {
  return <span className="text-[12px] ml-2">{formatRelativeDate(date)}</span>;
};
