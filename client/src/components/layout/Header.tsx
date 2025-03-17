import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useMembers } from "@/contexts/MembersContext";
import { BsPersonCircle } from "react-icons/bs";

function Header() {
  const { currentMember, setCurrentMember } = useCurrentMember();
  const { members } = useMembers();

  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">AI Vision inside</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage src={currentMember?.avatar} alt="User avatar" />
            <AvatarFallback>
              <BsPersonCircle className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>멤버 변경</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentMember?.id}
            onValueChange={(value) => {
              const member = members.find((member) => member.id === value);
              if (member) setCurrentMember(member);
            }}
          >
            {members.map((member) => (
              <DropdownMenuRadioItem key={member.id} value={member.id}>
                <Avatar>
                  <AvatarImage src={member.avatar} alt="User avatar" />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default Header;
