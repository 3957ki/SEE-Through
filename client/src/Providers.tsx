import { CurrentMemberProvider } from "@/contexts/CurrentMemberContext";
import { MembersProvider } from "@/contexts/MembersContext";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MembersProvider>
      <CurrentMemberProvider>{children}</CurrentMemberProvider>
    </MembersProvider>
  );
}

export default Providers;
