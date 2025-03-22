import { MemberSwitcherDialog } from "@/components/dialog/MemberSwitcherDialog";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { BsPersonCircle } from "react-icons/bs";

function Header() {
  const { currentMember } = useCurrentMember();
  const { showDialog } = useDialog();

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">SEE-Through</h1>
      <Avatar
        className="h-10 w-10 cursor-pointer bg-gray-100 rounded-full"
        onClick={() => showDialog(<MemberSwitcherDialog />)}
      >
        <AvatarImage src={currentMember?.avatar} alt="User avatar" />
        <AvatarFallback>
          <BsPersonCircle className="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

export default Header;
