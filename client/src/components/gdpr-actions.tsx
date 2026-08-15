import {useState}                                 from "react";
import {Button}                                   from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input}                                    from "@/components/ui/input";
import {Label}                                    from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
}                                                 from "@/components/ui/alert-dialog";
import {Download, Edit3, Loader2, Shield, Trash2} from "lucide-react";
import {useMutation, useQueryClient}              from "@tanstack/react-query";
import {useToast}                                 from "@/hooks/use-toast";
import {useAuth}                                  from "@/hooks/useAuth";

/** Renders GDPR export, rectification, and erasure controls. */
export default function GDPRActions() {
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const {
              user,
              isAuthenticated,
          } = useAuth();
    
    console.log(
        "GDPRActions rendered - authenticated:",
        isAuthenticated,
        "user:",
        user?.email,
    );
    
    // Show a warning if not authenticated
    if (!isAuthenticated) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                        <Shield className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">
                            Please sign in, to access the GDPR features.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const exportMidiDataMutation = useMutation({
                                                   mutationFn: async () => {
                                                       console.log("Starting GDPR MIDI data export...");
                                                       const response = await fetch("/api/gdpr/midi-export",
                                                                                    {
                                                                                        credentials: "include",
                                                                                    });
                                                       
                                                       if (!response.ok) {
                                                           throw new Error(`Data export failed: ${response.status}`);
                                                       }
                                                       
                                                       const blob = await response.blob();
                                                       const url = window.URL.createObjectURL(blob);
                                                       const a = document.createElement("a");
                                                       a.href = url;
                                                       a.download = "user-midi-files.csv";
                                                       document.body.appendChild(a);
                                                       a.click();
                                                       document.body.removeChild(a);
                                                       window.URL.revokeObjectURL(url);
                                                   },
                                                   onSuccess:  () => {
                                                       toast({
                                                                 title:       "Data export successful",
                                                                 description: "Your MIDI files data backup has been downloaded.",
                                                             });
                                                   },
                                                   onError:    () => {
                                                       toast({
                                                                 title:   "Data export failed",
                                                                 description:
                                                                          "Unable to export your MIDI files data backup. Please try again.",
                                                                 variant: "destructive",
                                                             });
                                                   },
                                               });
    
    const exportUserDataMutation = useMutation({
                                                   mutationFn: async () => {
                                                       console.log("Starting the GDPR user data export...");
                                                       const response = await fetch("/api/gdpr/user-export",
                                                                                    {
                                                                                        credentials: "include",
                                                                                    });
                                                       
                                                       if (!response.ok) {
                                                           throw new Error(`Data export failed: ${response.status}`);
                                                       }
                                                       
                                                       const blob = await response.blob();
                                                       const url = window.URL.createObjectURL(blob);
                                                       const a = document.createElement("a");
                                                       a.href = url;
                                                       a.download = "user-profile-data.csv";
                                                       document.body.appendChild(a);
                                                       a.click();
                                                       document.body.removeChild(a);
                                                       window.URL.revokeObjectURL(url);
                                                   },
                                                   onSuccess:  () => {
                                                       toast({
                                                                 title:       "Data export successful",
                                                                 description: "Your user profile data backup has been downloaded.",
                                                             });
                                                   },
                                                   onError:    () => {
                                                       toast({
                                                                 title:   "Data export failed",
                                                                 description:
                                                                          "Unable to export your user data backup. Please try again.",
                                                                 variant: "destructive",
                                                             });
                                                   },
                                               });
    
    const updateDataMutation = useMutation({
                                               mutationFn: async (data: { firstName?: string; lastName?: string }) => {
                                                   console.log("Updating user data:", data);
                                                   const response = await fetch("/api/gdpr/update-data",
                                                                                {
                                                                                    method:      "PUT",
                                                                                    headers:     { "Content-Type": "application/json" },
                                                                                    credentials: "include",
                                                                                body:        JSON.stringify(data),
                                                                                });
                                                   if (!response.ok) throw new Error("Update failed");
                                                   return response.json();
                                               },
                                               onSuccess:  () => {
                                                   toast({
                                                             title:       "User data update success",
                                                             description: "Your profile information has been updated.",
                                                         });
                                                   // noinspection JSUnusedLocalSymbols
                                                   queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }).then(r => {
                                                   });
                                                   // noinspection JSUnusedLocalSymbols
                                                   queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }).then(r => {
                                                   });
                                                   setNewFirstName("");
                                                   setNewLastName("");
                                               },
                                               onError:    () => {
                                                   toast({
                                                             title:       "User data update failed",
                                                             description: "Unable to update your user data. Please try again.",
                                                             variant:     "destructive",
                                                         });
                                               },
                                           });
    
    const deleteAccountMutation = useMutation({
                                                  mutationFn: async () => {
                                                      console.log("Deleting user account...");
                                                      const response = await fetch("/api/gdpr/delete-account",
                                                                                   {
                                                                                       method:      "DELETE",
                                                                                       credentials: "include",
                                                                                       headers:     { "Content-Type": "application/json" },
                                                                                   });
                                                      if (!response.ok) throw new Error("Delete failed");
                                                      return response.json();
                                                  },
                                                  onSuccess:  () => {
                                                      toast({
                                                                title:       "Account deleted",
                                                                description: "Your account and all data have been permanently deleted.",
                                                            });
                                                      // Refresh the page to clear auth state
                                                      setTimeout(() => window.location.reload(),
                                                                 2000);
                                                  },
                                                  onError:    () => {
                                                      toast({
                                                                title:   "Account deletion failed",
                                                                description:
                                                                         "Unable to delete your account. Please contact our Support.",
                                                                variant: "destructive",
                                                            });
                                                  },
                                              });
    
    return (
        <div className="space-y-4">
            {/* Notice for Additional Rights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                    <strong>Additional rights:</strong> For Right to Object and Withdraw
                    Consent, contact{" "}
                    <a href={`mailto:${__GDPR_DPO_EMAIL__}`}>
                        {__GDPR_DPO_EMAIL__}
                    </a>
                    .
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-2"/>
                        GDPR Data Rights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Data Export */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Export User Profile data</p>
                            <p className="text-xs text-gray-500">
                                Download your personal account information.
                            </p>
                            <Button
                                onClick={() => exportUserDataMutation.mutate()}
                                disabled={exportUserDataMutation.isPending}
                                className="w-full mt-2"
                                size="sm"
                            >
                                {exportUserDataMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Exporting...
                                    </>
                                ) : (
                                     <>
                                         <Download className="mr-2 h-4 w-4"/>
                                         Export User Profile (CSV)
                                     </>
                                 )}
                            </Button>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium">Export Your Usage Data</p>
                            <p className="text-xs text-gray-500">
                                Download all your usage data, such as MIDI generations.
                            </p>
                            <Button
                                onClick={() => exportMidiDataMutation.mutate()}
                                disabled={exportMidiDataMutation.isPending}
                                variant="outline"
                                className="w-full mt-2"
                                size="sm"
                            >
                                {exportMidiDataMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Exporting...
                                    </>
                                ) : (
                                     <>
                                         <Download className="mr-2 h-4 w-4"/>
                                         Export MIDI Files (CSV)
                                     </>
                                 )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Update Data */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Update your name
                        </Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Input
                                id="first-name"
                                value={newFirstName}
                                onChange={(e) => setNewFirstName(e.target.value)}
                                placeholder={user?.firstName || "First name"}
                                className="text-xs"
                            />
                            <Input
                                id="last-name"
                                value={newLastName}
                                onChange={(e) => setNewLastName(e.target.value)}
                                placeholder={user?.lastName || "Last name"}
                                className="text-xs"
                            />
                        </div>
                        <Button
                            size="sm"
                            onClick={() => updateDataMutation.mutate({
                                ...(newFirstName.trim() ? { firstName: newFirstName.trim() } : {}),
                                ...(newLastName.trim() ? { lastName: newLastName.trim() } : {}),
                            })}
                            disabled={(!newFirstName.trim() && !newLastName.trim()) || updateDataMutation.isPending}
                        >
                            <Edit3 className="h-3 w-3 mr-1"/>
                            Update name
                        </Button>
                    </div>
                    
                    {/* Delete Account */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                            <p className="text-sm font-medium text-red-700">Delete Account</p>
                            <p className="text-xs text-gray-500">
                                Permanently delete all your data.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3 mr-1"/>
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete
                                        your account, your Downloads History, and all associated
                                        data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            console.log("Delete account button clicked");
                                            deleteAccountMutation.mutate();
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
