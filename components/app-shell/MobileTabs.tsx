import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";

type MobileTabsProps = {
  workspace: ReactNode;
  quote: ReactNode;
};

export function MobileTabs({ workspace, quote }: MobileTabsProps) {
  return (
    <Tabs defaultValue="workspace" className="flex min-h-0 flex-1 flex-col">
      <TabsList className="mx-4 mt-4 grid grid-cols-2">
        <TabsTrigger value="workspace">Saisie</TabsTrigger>
        <TabsTrigger value="quote">Devis</TabsTrigger>
      </TabsList>
      <TabsContent value="workspace" className="mt-0 min-h-0 flex-1">
        {workspace}
      </TabsContent>
      <TabsContent
        value="quote"
        className="mt-0 min-h-0 flex-1 overflow-auto bg-[#eef2ec]"
      >
        {quote}
      </TabsContent>
    </Tabs>
  );
}
