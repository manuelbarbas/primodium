import { Card, SecondaryCard } from "../../core/Card";

export const Resources: React.FC = () => (
  <Card className="w-120 grid grid-cols-6 gap-1">
    <SecondaryCard className="col-span-4">Resources</SecondaryCard>
    <SecondaryCard className="col-span-2">Utilities</SecondaryCard>
  </Card>
);
