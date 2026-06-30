import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface WorkerStatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

export const WorkerStatsCard: React.FC<WorkerStatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
}) => {
  const trendIcon =
    trend === "up" ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : trend === "down" ? (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    ) : (
      <Minus className="w-4 h-4 text-gray-400" />
    );

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
        <CardTitle className="text-sm font-bold text-slate-500">
          {title}
        </CardTitle>
        <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">{icon}</div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-3xl font-extrabold text-slate-900">{value}</div>
        <div className="flex items-center text-xs text-slate-400 mt-2 font-semibold">
          {trendIcon}
          <span className="ml-1">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
};
