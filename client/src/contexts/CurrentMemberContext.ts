import Member from "@/interfaces/Member";
import { createContext } from "react";

const CurrentMemberContext = createContext<{
  currentMember: Member | null;
  // eslint-disable-next-line no-unused-vars
  setCurrentMember: (member: Member | null) => void;
}>({ currentMember: null, setCurrentMember: () => {} });

export default CurrentMemberContext;
