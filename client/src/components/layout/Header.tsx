import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { BsPersonCircle } from "react-icons/bs";
function Header() {
  const { currentMember } = useCurrentMember();
  const { showDialog } = useDialog();

  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">AI Vision inside</h1>
      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => showDialog(<div>test</div>)}>
        <AvatarImage src={currentMember?.avatar} alt="User avatar" />
        <AvatarFallback>
          <BsPersonCircle className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

export default Header;
