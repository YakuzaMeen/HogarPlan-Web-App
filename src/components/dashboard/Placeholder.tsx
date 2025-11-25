import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { WrenchIcon } from "lucide-react";

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full h-16 w-16 flex items-center justify-center">
            <WrenchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground">
            Esta sección se encuentra actualmente en desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
