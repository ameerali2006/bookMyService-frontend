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
    <Card className="bg-white border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-gray-100">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trendIcon}
          <span className="ml-1">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
};
