"use client";

import { useUIStore } from "@/lib/stores";
import { CoffeeForm } from "@/components/coffee";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function AddCoffeeModal() {
  const { addCoffeeModalOpen, setAddCoffeeModal } = useUIStore();

  return (
    <Sheet open={addCoffeeModalOpen} onOpenChange={setAddCoffeeModal}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="font-display text-espresso">Nueva reseña</SheetTitle>
        </SheetHeader>
        <CoffeeForm
          mode="create"
          onSuccess={() => setAddCoffeeModal(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
