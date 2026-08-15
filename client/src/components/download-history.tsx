import * as React                                                         from "react";
import {useState}                                                         from "react";
import {useMutation, useQuery, useQueryClient}                            from "@tanstack/react-query";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
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
}                                                                         from "@/components/ui/alert-dialog";
import {Button}                                                           from "@/components/ui/button";
import {ScrollArea}                                                       from "@/components/ui/scroll-area";
import {Badge}                                                            from "@/components/ui/badge";
import {Clock, Download, History, Trash2}                                 from "lucide-react";
import {formatDistanceToNow}                                              from "date-fns";
import {useAuth}                                                          from "@/hooks/useAuth";

interface UserDownload {
    id: number;
    filename: string;
    friendlyName?: string;
    downloadedAt: Date;
    midiFileId: number;
}

interface DownloadHistoryProps {
    trigger?: React.ReactNode;
}

/** Displays and manages the authenticated user's MIDI download history. */
export default function DownloadHistory({ trigger }: DownloadHistoryProps) {
    const [open, setOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    
    const {
              data: downloads,
              isLoading,
              error,
          } = useQuery({
                           queryKey:             ["/api/user/downloads"],
                           enabled:              isAuthenticated,
                           retry:                false,
                           refetchOnWindowFocus: false,
                           refetchInterval:      false,
                           staleTime:            300000,
                       });
    
    // Refetch downloads when authentication status changes
    React.useEffect(() => {
                        if (isAuthenticated && open) {
                            void queryClient.invalidateQueries({ queryKey: ["/api/user/downloads"] });
                        }
                    },
                    [isAuthenticated, open, queryClient]);
    
    const clearAllDownloadsMutation = useMutation({
                                                      mutationFn: async () => {
                                                          console.log("Clearing all downloads...");
                                                          const response = await fetch("/api/user/downloads/clear",
                                                                                       {
                                                                                           method:      "DELETE",
                                                                                           credentials: "include",
                                                                                           headers:     {
                                                                                               "Content-Type": "application/json",
                                                                                           },
                                                                                       });
                                                          console.log("Clear all response status:",
                                                                      response.status);
                                                          if (!response.ok) {
                                                              const errorText = await response.text();
                                                              console.error("Clear all failed:",
                                                                            errorText);
                                                              throw new Error(`Failed to clear downloads: ${errorText}`);
                                                          }
                                                          return response.json();
                                                      },
                                                      onSuccess:  async (data: any) => {
                                                          console.log("Clear all downloads successful:",
                                                                      data);
                                                          // Set empty data and prevent refetch
                                                          queryClient.setQueryData(["/api/user/downloads"],
                                                                                   []);
                                                          await queryClient.invalidateQueries({ queryKey: ["/api/user/downloads"] });
                                                      },
                                                      onError:    (error: any) => {
                                                          console.error("Clear all downloads error:",
                                                                        error);
                                                      },
                                                  });
    
    const deleteSingleMutation = useMutation({
                                                 mutationFn: async (midiFileId: number) => {
                                                     console.log("Deleting single file:",
                                                                 midiFileId);
                                                     const response = await fetch(`/api/midi-files/${midiFileId}`,
                                                                                  {
                                                                                      method:      "DELETE",
                                                                                      credentials: "include",
                                                                                      headers:     {
                                                                                          "Content-Type": "application/json",
                                                                                      },
                                                                                  });
                                                     console.log("Delete file response status:",
                                                                 response.status);
                                                     if (!response.ok) {
                                                         const errorText = await response.text();
                                                         console.error("Delete file failed:",
                                                                       errorText);
                                                         throw new Error(`Failed to delete file: ${errorText}`);
                                                     }
                                                     return response.json();
                                                 },
                                                 onSuccess:  (data, variables) => {
                                                     console.log(
                                                         "Single file delete successful; updating UI for file:",
                                                         variables,
                                                     );
                                                     // Immediately update cached data by removing the deleted item
                                                     queryClient.setQueryData(["/api/user/downloads"],
                                                                              (oldData: any[]) => {
                                                                                  if (!oldData) return [];
                                                                                  return oldData.filter((download) => download.midiFileId !== variables);
                                                                              });
                                                     // Also invalidate to ensure fresh data on next fetch
                                                     void queryClient.invalidateQueries({ queryKey: ["/api/user/downloads"] });
                                                 },
                                                 onError:    (error) => {
                                                     console.error("Single file delete error:",
                                                                   error);
                                                 },
                                             });
    
    console.log("Downloads History state:",
                {
                    downloads,
                    isLoading,
                    error,
                    open,
                    isAuthenticated,
                });
    
    /** Opens a historical MIDI file in a new browser tab. */
    const handleDownload = (filename: string) => {
        window.open(`/api/download/midi/${filename}`,
                    "_blank");
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2"/>
                        Download History
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="max-w-2xl max-h-[80vh]"
                aria-describedby="history-description"
            >
                <DialogHeader style={{ marginTop: 7}}>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <History className="h-5 w-5 mr-2"/>
                            Download History: {((downloads as unknown as any[])?.length || 0)}
                        </div>
                        {(downloads as any[])?.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Trash2 className="w-4 h-4 mr-2"/>
                                        Clear all
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Clear all Downloads History?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all of your downloaded MIDI
                                            files from the server, and clear all entries from your
                                            Downloads History. This action cannot be undone!
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => clearAllDownloadsMutation.mutate()}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={clearAllDownloadsMutation.isPending}
                                        >
                                            {clearAllDownloadsMutation.isPending
                                             ? "Clearing..."
                                             : "Yes, clear all"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </DialogTitle>
                    <p id="history-description" className="text-sm text-gray-600">
                        View and re-download your previously generated MIDI files:
                    </p>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh]">
                    {!isAuthenticated ? (
                        <div className="text-center py-8 text-gray-500">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>Please sign in, to view your Downloads History.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>Error while loading Downloads History</p>
                            <p className="text-xs">{error.toString()}</p>
                        </div>
                    ) : !(downloads as any[]) || (downloads as any[]).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>No Downloads yet</p>
                            <p className="text-sm">
                                Generate a few MIDI files, to see them here.
                            </p>
                        </div>
                    ) : (
                            <div className="space-y-3">
                                {(downloads as any[]).map((download: UserDownload) => (
                                    <div
                                        key={download.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm truncate">
                                                {download.friendlyName || download.filename}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {download.filename}
                                            </p>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Clock className="h-3 w-3 mr-1"/>
                                                {formatDistanceToNow(new Date(download.downloadedAt),
                                                                     {
                                                                         addSuffix: true,
                                                                     })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                MIDI
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(download.filename)}
                                                    className="text-xs px-2 py-1"
                                                >
                                                    <Download className="h-3 w-3 mr-1"/>
                                                    Download
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        deleteSingleMutation.mutate(download.midiFileId)
                                                    }
                                                    disabled={deleteSingleMutation.isPending}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                                                >
                                                    <Trash2 className="h-3 w-3"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </ScrollArea>
                
                {(downloads as any[])?.length > 0 && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        Showing the last 50 Downloads
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
