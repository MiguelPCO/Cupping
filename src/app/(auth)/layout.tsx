import { GrainTexture } from "@/components/ui/grain-texture";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cream px-4">
      <GrainTexture />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
