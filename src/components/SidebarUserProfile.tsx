import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarUserProfileProps {
  isCollapsed: boolean;
}

export function SidebarUserProfile({ isCollapsed }: SidebarUserProfileProps) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/placeholder.svg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col transition-opacity duration-200 whitespace-nowrap",
          isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
        )}
      >
        <p className="text-sm font-medium leading-none truncate">John Doe</p>
        <p className="text-xs leading-none text-muted-foreground truncate">
          j.doe@example.com
        </p>
      </div>
    </div>
  );
}