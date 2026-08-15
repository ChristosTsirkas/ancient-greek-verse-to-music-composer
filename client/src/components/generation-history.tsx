import {useEffect, useState}                                             from "react";
import {Button}                                                          from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle}                        from "@/components/ui/card";
import {Badge}                                                           from "@/components/ui/badge";
import {Download, History, Trash2}                                       from "lucide-react";
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
}                                                                        from "@/components/ui/alert-dialog";
import {useAuth}                                                         from "@/hooks/useAuth";

interface CachedGeneration {
    data: any;
    response: any;
    timestamp: string;
    description: string;
}

/** Displays locally retained generation history for guest users. */
export default function GenerationHistory() {
    const [history, setHistory] = useState<
        Array<{ key: string; data: CachedGeneration }>
    >([]);
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
                  loadHistory();
                  
                  // Listen for new MIDI generations
                  /** Refreshes history after a local generation event. */
                  const handleMidiGenerated = () => {
                      loadHistory();
                  };
                  
                  // Reload on window focus to catch any changes
                  /** Refreshes history when the browser window regains focus. */
                  const handleFocus = () => {
                      loadHistory();
                  };
                  
                  // Reload on storage changes from other tabs
                  /** Refreshes history after a relevant cross-tab storage change. */
                  const handleStorageChange = (e: StorageEvent) => {
                      if (e.key?.startsWith("midi_")) {
                          loadHistory();
                      }
                  };
                  
                  window.addEventListener("midiGenerated",
                                          handleMidiGenerated);
                  window.addEventListener("focus",
                                          handleFocus);
                  window.addEventListener("storage",
                                          handleStorageChange);
                  
                  return () => {
                      window.removeEventListener("midiGenerated",
                                                 handleMidiGenerated);
                      window.removeEventListener("focus",
                                                 handleFocus);
                      window.removeEventListener("storage",
                                                 handleStorageChange);
                  };
              },
              []);
    
    // Force reload history when authentication state changes
    useEffect(() => {
                  if (!isAuthenticated) {
                      const timer = setTimeout(() => {
                                                   loadHistory();
                                               },
                                               100);
                      return () => clearTimeout(timer);
                  }
              },
              [isAuthenticated]);
    
    /** Loads and sorts retained generation entries from local storage. */
    const loadHistory = () => {
        try {
            console.log("Loading guest history from localStorage...");
            const keys = Object.keys(localStorage).filter((key) =>
                                                              key.startsWith("midi_"),
            );
            console.log("Found localStorage keys:",
                        keys.length);

            const historyData = keys
                .map((key) => {
                    try {
                        const data = JSON.parse(localStorage.getItem(key) || "{}");
                        return {
                            key,
                            data,
                        };
                    }
                    catch (e) {
                        console.warn("Invalid history entry:", key);
                        return null;
                    }
                })
                .filter((item): item is { key: string; data: CachedGeneration } =>
                    item !== null && item.data.response
                )
                .sort((a, b) => {
                    return new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime();
                })
                .slice(0, 20); // Keep last 20 generations
            
            console.log("Loaded guest history items:",
                        historyData.length);
            setHistory(historyData);
        }
        catch (error) {
            console.error("Error loading history:",
                          error);
            setHistory([]);
        }
    };
    
    // Don't show guest history if user is authenticated
    if (isAuthenticated) {
        return null;
    }
    
    /** Downloads a MIDI file from a retained generation entry. */
    const downloadFromHistory = (downloadUrl: string) => {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    /** Deletes all guest generation files and clears local history. */
    const clearHistory = async () => {
        try {
            // Delete all guest files from server first
            for (const item of history) {
                if (item.data.response?.midiFileId) {
                    try {
                        await fetch(`/api/midi-files/${item.data.response.midiFileId}`,
                                    {
                                        method:      "DELETE",
                                        credentials: "include",
                                    });
                        console.log(
                            "Deleted guest file from server:",
                            item.data.response.midiFileId,
                        );
                    }
                    catch (error) {
                        console.error("Error deleting guest file from server:",
                                      error);
                    }
                }
            }
            
            // Clear local storage
            Object.keys(localStorage)
                  .filter((key) => key.startsWith("midi_"))
                  .forEach((key) => localStorage.removeItem(key));
            setHistory([]);
            console.log("Cleared guest history from localStorage");
        }
        catch (error) {
            console.error("Error clearing guest history:",
                          error);
        }
    };
    
    /** Deletes one retained generation entry and its server file. */
    const deleteItem = async (key: string, midiFileId?: number) => {
        try {
            // Delete from server if it has an ID
            if (midiFileId) {
                console.log("Attempting to delete file from server:",
                            midiFileId);
                const response = await fetch(`/api/midi-files/${midiFileId}`,
                                             {
                                                 method:      "DELETE",
                                                 credentials: "include",
                                             });
                
                if (response.ok) {
                    console.log("Successfully deleted file from server:",
                                midiFileId);
                } else {
                    console.error("Server responded with error:",
                                  response.status);
                }
            } else {
                console.log("No midiFileId provided for deletion");
            }
            
            // Remove from local storage
            localStorage.removeItem(key);
            loadHistory();
        }
        catch (error) {
            console.error("Error deleting item:",
                          error);
        }
    };
    
    /** Formats a generation timestamp for display. */
    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2"/>
                    History ({history.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        MIDI Generation History (Guest)
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Clear all
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear all History?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove all your local generation
                                        history, and delete the associated files from the server.
                                        This action cannot be undone!
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={clearHistory}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Yes, clear all
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No generations in History
                        </p>
                    ) : (
                         history.map(({
                                          key,
                                          data,
                                      }) => (
                             <Card key={key} className="relative">
                                 <CardHeader className="pb-2">
                                     <div className="flex items-center justify-between">
                                         <CardTitle className="text-sm">
                                             {data.description}
                                         </CardTitle>
                                         <div className="flex items-center space-x-2">
                                             <Badge variant="secondary" className="text-xs">
                                                 {formatDate(data.timestamp)}
                                             </Badge>
                                             <Button
                                                 onClick={() =>
                                                     deleteItem(key,
                                                                data.response?.midiFileId)
                                                 }
                                                 variant="ghost"
                                                 size="sm"
                                                 className="h-6 w-6 p-0"
                                             >
                                                 <Trash2 className="w-3 h-3"/>
                                             </Button>
                                         </div>
                                     </div>
                                 </CardHeader>
                                 <CardContent className="pt-0">
                                     <div className="flex items-center justify-between">
                                         <div className="text-xs text-muted-foreground space-x-2">
                                             <span>Verses: {data.data.verses?.length || 0}</span>
                                             <span>•</span>
                                             <span>•</span>
                                             <span>Mode: {data.data.mode}</span>
                                         </div>
                                         <Button
                                             onClick={() =>
                                                 downloadFromHistory(data.response.downloadUrl)
                                             }
                                             size="sm"
                                             variant="outline"
                                         >
                                             <Download className="w-4 h-4 mr-2"/>
                                             Download
                                         </Button>
                                     </div>
                                 </CardContent>
                             </Card>
                         ))
                     )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
