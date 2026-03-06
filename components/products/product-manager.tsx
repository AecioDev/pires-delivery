"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductDialog } from "./product-dialog";

export function ProductManager({
  defaultType,
  buttonText,
}: {
  defaultType?: "ITEM" | "COMPOSITE" | "COMPONENT";
  buttonText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> {buttonText || "Novo Produto"}
      </Button>

      {/* Controlled Dialog */}
      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        defaultType={defaultType}
      />
    </>
  );
}
