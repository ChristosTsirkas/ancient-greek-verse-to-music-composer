// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedLocalSymbols

import {useState}                                 from "react";
import {Button}                                   from "@/components/ui/button";
import {Input}                                    from "@/components/ui/input";
import {Label}                                    from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Disc3,
    Download,
    Drum,
    Hand,
    HandMetal,
    Loader2,
    Music,
    Volume2,
    Waves,
    Wind,
    Zap,
}                                                 from "lucide-react";
import {useMutation}                              from "@tanstack/react-query";
import {useToast}                                 from "@/hooks/use-toast";
import {MidiGenerationRequest}                    from "@shared/schema";

interface MidiInputPanelProps {
    verses: Array<{ text: string; metrics: string }>;
    settings: {
        instrument:
            | "aulos"
            | "lyra"
            | "tympanon"
            | "salpinx"
            | "krotala"
            | "kymbala"
            | "sistrum"
            | "rhoptron"
            | "keraunoskopion"
            | "hand_clap_light"
            | "hand_clap_strong";
        tempo: number;
        mode: "dorian" | "phrygian" | "lydian";
        includeMetronome: boolean;
        includeAccentTrack: boolean;
        includeVocalGuide: boolean;
        allowMelody: boolean;
        outputFormat: "midi" | "wav";
        experimental: any;
    };
    onSettingsChange?: () => void;
}

/** Renders the standalone MIDI generation controls. */
export default function MidiInputPanel({
                                           verses,
                                           settings,
                                           onSettingsChange,
                                       }: MidiInputPanelProps) {
    const [friendlyName, setFriendlyName] = useState(
        `Request ${new Date().getTime().toString().slice(-6)}`,
    );
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const { toast } = useToast();
    
    // Ancient Greek instrument icons mapping
    const instrumentIcons = {
        aulos:            Wind,
        lyra:             Music,
        tympanon:         Drum,
        salpinx:          Volume2,
        krotala:          HandMetal,
        kymbala:          Bell,
        sistrum:          Waves,
        rhoptron:         Disc3,
        keraunoskopion:   Zap,
        hand_clap_light:  Hand,
        hand_clap_strong: Hand,
    };
    
    /** Resolves the icon used for an instrument name. */
    const getInstrumentIcon = (instrument: string) => {
        const IconComponent =
                  instrumentIcons[instrument as keyof typeof instrumentIcons];
        return IconComponent ? (
            <IconComponent className="h-4 w-4"/>
        ) : (
                   <Music className="h-4 w-4"/>
               );
    };
    
    const generateMidiMutation = useMutation({
                                                 mutationFn: async (data: MidiGenerationRequest) => {
                                                     const requestData = {
                                                         ...data,
                                                         friendlyName,
                                                     };
                                                     const response = await fetch("/api/generate-midi",
                                                                                  {
                                                                                      method:  "POST",
                                                                                      headers: {
                                                                                          "Content-Type": "application/json",
                                                                                      },
                                                                                      body:    JSON.stringify(requestData),
                                                                                  });
                                                     if (!response.ok) {
                                                         const error = await response.text();
                                                         throw new Error(error || "Failed to generate MIDI");
                                                     }
                                                     return await response.json();
                                                 },
                                                 onSuccess:  (data) => {
                                                     setDownloadUrl(data.downloadUrl);
                                                     toast({
                                                               title:       "MIDI generation successful!",
                                                               description: "Your verses have been converted to MIDI format.",
                                                           });
                                                     setFriendlyName(`Request ${new Date().getTime().toString().slice(-6)}`);
                                                 },
                                                 onError:    (error) => {
                                                     toast({
                                                               title:   "Error",
                                                               description:
                                                                        error.message ||
                                                                        "Failed to generate the MIDI file. Please check your input format, and then try again.",
                                                               variant: "destructive",
                                                           });
                                                 },
                                             });
    
    /** Validates the request and starts MIDI generation. */
    const handleGenerateMidi = () => {
        if (!verses.length || !settings) {
            toast({
                      title:   "Error",
                      description:
                               "Please add at least one verse, and configure the settings.",
                      variant: "destructive",
                  });
            return;
        }
        
        // Validate verses
        const validVerses = verses.filter((v) => v.text.trim() && v.metrics.trim());
        if (validVerses.length === 0) {
            toast({
                      title:   "Error",
                      description:
                               "Please fill in both the text and the metrical pattern, for each verse.",
                      variant: "destructive",
                  });
            return;
        }
        
        generateMidiMutation.mutate({
                                        verses:             validVerses,
                                        friendlyName,
                                        instrument:         settings.instrument,
                                        tempo:              settings.tempo,
                                        mode:               settings.mode,
                                        includeMetronome:   settings.includeMetronome,
                                        includeAccentTrack: settings.includeAccentTrack,
                                        includeVocalGuide:  settings.includeVocalGuide,
                                        allowMelody:        settings.allowMelody,
                                        outputFormat:       settings.outputFormat,
                                        experimental:       settings.experimental,
                                    });
    };
    
    /** Opens the latest generated MIDI download. */
    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl,
                        "_blank");
        }
    };
    
    return (
        <>
            {/* Request Name Input */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Request details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Label
                            htmlFor="friendly-name"
                            className="text-sm font-medium mb-2 block"
                        >
                            Request name
                        </Label>
                        <Input
                            id="friendly-name"
                            value={friendlyName}
                            onChange={(e) => setFriendlyName(e.target.value)}
                            placeholder="Enter a name for this verse generation request."
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This name will appear in your Downloads History.
                        </p>
                    </div>
                    
                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerateMidi}
                        disabled={generateMidiMutation.isPending}
                        className="w-full bg-classical-blue-700 hover:bg-classical-blue-800 text-white text-lg font-medium py-4"
                    >
                        {generateMidiMutation.isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-3 animate-spin"/>
                                Generating your MIDI file...
                            </>
                        ) : (
                             <>
                                 {getInstrumentIcon(settings?.instrument || "aulos")}
                                 <span className="ml-3">Generate MIDI file</span>
                             </>
                         )}
                    </Button>
                </CardContent>
            </Card>
            
            {/* Status Panel */}
            {(
                 generateMidiMutation.isPending ||
                 generateMidiMutation.isSuccess ||
                 generateMidiMutation.isError
             ) && (
                 <Card>
                     <CardContent className="pt-6">
                         {generateMidiMutation.isPending && (
                             <div className="text-center">
                                 <div className="flex justify-center mb-4">
                                     <Loader2 className="h-12 w-12 text-classical-blue-700 animate-spin"/>
                                 </div>
                                 <p className="text-classical-blue-700 font-medium">
                                     Generating your MIDI file...
                                 </p>
                             </div>
                         )}
                         
                         {generateMidiMutation.isSuccess && (
                             <div className="text-center">
                                 <div className="flex justify-center mb-4">
                                     <div className="rounded-full bg-green-100 p-3">
                                         <CheckCircle className="h-8 w-8 text-green-600"/>
                                     </div>
                                 </div>
                                 <h3 className="text-lg font-semibold text-green-800 mb-2">
                                     MIDI generation successful!
                                 </h3>
                                 <p className="text-gray-600 mb-4">
                                     Your verses have been successfully converted to MIDI format.
                                 </p>

                                 <Button
                                     onClick={handleDownload}
                                     className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                                 >
                                     <Download className="h-4 w-4 mr-2"/>
                                     Download MIDI file
                                 </Button>
                             </div>
                         )}
                         
                         {generateMidiMutation.isError && (
                             <div className="text-center">
                                 <div className="flex justify-center mb-4">
                                     <div className="rounded-full bg-red-100 p-3">
                                         <AlertCircle className="h-8 w-8 text-red-600"/>
                                     </div>
                                 </div>
                                 <h3 className="text-lg font-semibold text-red-800 mb-2">
                                     Generation failed
                                 </h3>
                                 <p className="text-gray-600 mb-4">
                                     {generateMidiMutation.error?.message ||
                                      "Please check your input format, and then try again."}
                                 </p>
                                 
                                 <Button
                                     onClick={() => generateMidiMutation.reset()}
                                     variant="outline"
                                     className="w-full"
                                 >
                                     Try again
                                 </Button>
                             </div>
                         )}
                     </CardContent>
                 </Card>
             )}
        </>
    );
}
