import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";

export function AuthStatus() {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();
  const [_, setLocation] = useLocation();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        Загрузка...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/account")}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Вход
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.name || "Пользователь"} />
            ) : (
              <AvatarFallback>{profile?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            )}
          </Avatar>
          <span className="hidden md:inline">{profile?.name || "Пользователь"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="h-4 w-4 mr-2" />
            Профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User className="h-4 w-4 mr-2" />
            Аккаунт
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}