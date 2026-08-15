import {Button}        from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
}                      from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
}                      from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}                      from "@/components/ui/dialog";
import {
    History,
    LogOut,
    Shield,
    User,
}                      from "lucide-react";
import {
    useAuth,
    useLogout,
}                      from "@/hooks/useAuth";
import GDPRActions     from "@/components/gdpr-actions";
import DownloadHistory from "@/components/download-history";
import GDPRConsent     from "@/components/gdpr-consent";

/** Renders authentication controls and account actions. */
export default function AuthButton() {
    const {
              user,
              isAuthenticated,
              isLoading,
          } = useAuth();
    const logout = useLogout();
    
    if (isLoading) {
        return <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"/>;
    }
    
    if (!isAuthenticated) {
        return (
            <GDPRConsent>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                    <User className="h-4 w-4"/>
                    <span>Sign in with Google</span>
                </Button>
            </GDPRConsent>
        );
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                >
                    <Avatar className="h-6 w-6">
                        <AvatarImage
                            src={user?.profileImageUrl}
                            alt={`${user?.firstName} ${user?.lastName}`}
                        />
                        <AvatarFallback>
                            {user?.firstName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user?.firstName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DownloadHistory
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <History className="h-4 w-4 mr-2"/>
                            Downloads History
                        </DropdownMenuItem>
                    }
                />
                <DropdownMenuSeparator/>
                <Dialog>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Shield className="h-4 w-4 mr-2"/>
                            Privacy & Data Rights
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent
                        className="max-w-md"
                        aria-describedby="gdpr-description"
                    >
                        <DialogHeader>
                            <DialogTitle>Privacy & Data Rights</DialogTitle>
                            <p id="gdpr-description" className="text-sm text-gray-600">
                                Manage your personal data and exercise your GDPR rights.
                            </p>
                        </DialogHeader>
                        <GDPRActions/>
                    </DialogContent>
                </Dialog>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => logout.mutate()}>
                    <LogOut className="h-4 w-4 mr-2"/>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
