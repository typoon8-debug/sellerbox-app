"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

/** 클라이언트 전용 인쇄 버튼 */
export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline-gray">
      <Printer className="mr-2 h-4 w-4" />
      인쇄
    </Button>
  );
}
