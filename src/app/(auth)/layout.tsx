import { GrainTexture } from "@/components/ui/grain-texture";
import { Spotlight } from "@/components/ui/spotlight";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cream px-4">
      <GrainTexture />
      <Spotlight />
      <div className="relative z-20 w-full">{children}</div>
    </div>
  );
}
