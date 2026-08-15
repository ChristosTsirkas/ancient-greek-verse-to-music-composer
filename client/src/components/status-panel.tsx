import {useEffect, useRef, useState}                              from "react";
import MidiAudioPlayer                                            from "midi-audio-player";
import {Button}                                                   from "@/components/ui/button";
import {Input}                                                    from "@/components/ui/input";
import {Label}                                                    from "@/components/ui/label";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Disc3,
    Download,
    Drum,
    FileText,
    Hand,
    HandMetal,
    Info,
    Loader2,
    Music,
    Play,
    Square,
    Volume2,
    Waves,
    Wind,
    Zap,
}                                                                 from "lucide-react";
import {useMutation}                                              from "@tanstack/react-query";
import {apiRequest}                                               from "@/lib/queryClient";
import {useToast}                                                 from "@/hooks/use-toast";
import {MidiGenerationRequest}                                    from "@shared/schema";
import GenerationHistory                                          from "./generation-history";

interface StatusPanelProps {
    verses?: Array<{ text: string; metrics: string }>;
    settings?: {
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
            | "hand_clap_strong"
            | "syrinx"
            | "kithara"
            | "phorminx"
            | "pandura";
        tempo: number;
        mode: "dorian" | "phrygian" | "lydian" | "mixolydian" | "aeolian";
        includeMetronome: boolean;
        includeAccentTrack: boolean;
        includeVocalGuide: boolean;
        outputFormat: "midi" | "wav";
        allowMelody: boolean;
        experimental: any;
    };
    onSettingsChange?: () => void;
}

/** Generates, previews, and exports the current MIDI composition. */
export default function StatusPanel({
                                        verses = [],
                                        settings,
                                        onSettingsChange,
                                    }: StatusPanelProps) {
    const [lastGeneratedKey, setLastGeneratedKey] = useState<string>("");
    const [friendlyName, setFriendlyName] = useState(
        `Request ${new Date().getTime().toString().slice(-6)}`,
    );
    
    // Ancient Greek instrument icons mapping
    const instrumentIcons = {
        aulos:            Wind,
        syrinx:           Wind,
        lyra:             Music,
        kithara:          Music,
        phorminx:         Music,
        pandura:          Music,
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
    
    // Create a key from current settings and verses to track changes
    const currentKey = JSON.stringify({
                                          verses,
                                          settings,
                                      });
    
    // Reset download state when settings/verses change
    useEffect(() => {
                  if (lastGeneratedKey && lastGeneratedKey !== currentKey) {
                      onSettingsChange?.();
                  }
              },
              [currentKey, lastGeneratedKey, onSettingsChange]);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [scoreDownloadUrl, setScoreDownloadUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewPlayerRef = useRef<MidiAudioPlayer | null>(null);
    const { toast } = useToast();

    /** Stops and releases the active browser MIDI preview player. */
    const stopPreview = () => {
        void previewPlayerRef.current?.stop();
        void previewPlayerRef.current?.close();
        previewPlayerRef.current = null;
        setIsPlaying(false);
    };

    useEffect(() => () => stopPreview(), []);
    
    const generateMidiMutation = useMutation({
                                                 mutationFn: async (data: MidiGenerationRequest) => {
                                                     const response = await apiRequest("POST",
                                                                                       "/api/generate-midi",
                                                                                       data);
                                                     const result = await response.json();
                                                     
                                                     // Store in local cache for history after successful generation
                                                     const cacheKey = `midi_${Date.now()}`;
                                                     const cacheData = {
                                                         data,
                                                         response:  result,
                                                         timestamp: new Date().toISOString(),
                                                         description:
                                                                    data.friendlyName ||
                                                                    `${data.instrument} - ${data.mode} - ${data.tempo}BPM - ${data.verses.length} verses`,
                                                     };
                                                     localStorage.setItem(cacheKey,
                                                                          JSON.stringify(cacheData));
                                                     
                                                     // Trigger a custom event so GenerationHistory can refresh
                                                     window.dispatchEvent(new Event("midiGenerated"));
                                                     
                                                     // Update generated key to track this generation
                                                     setLastGeneratedKey(
                                                         JSON.stringify({
                                                                            verses:   data.verses,
                                                                            settings: data,
                                                                        }),
                                                     );
                                                     
                                                     return result;
                                                 },
                                                 onSuccess:  (data) => {
                                                     stopPreview();
                                                     setPreviewError(null);
                                                     setDownloadUrl(data.downloadUrl);
                                                     setScoreDownloadUrl(data.scoreDownloadUrl);
                                                     toast({
                                                               title:       "MIDI generation successful!",
                                                               description: "Your verses have been converted to MIDI format.",
                                                           });
                                                     // Update friendly name for next request
                                                     setFriendlyName(`Request ${new Date().getTime().toString().slice(-6)}`);
                                                 },
                                                 onError:    (error) => {
                                                     toast({
                                                               title:   "Error",
                                                               description:
                                                                        error.message ||
                                                                        "Failed to generate MIDI file. Please check your input format, and then try again.",
                                                               variant: "destructive",
                                                           });
                                                 },
                                             });
    
    /** Validates the current composition and starts MIDI generation. */
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
                               "Please fill in both the text and the metrical patterns, per verse.",
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
                                        outputFormat:       settings.outputFormat,
                                        allowMelody:        settings.allowMelody,
                                        experimental:       settings.experimental,
                                    });
    };
    
    /** Opens the generated MIDI file for download. */
    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl,
                        "_blank");
        }
    };

    /** Opens the generated MusicXML score for download. */
    const handleScoreDownload = () => {
        if (scoreDownloadUrl) window.open(scoreDownloadUrl, "_blank");
    };

    /** Loads and starts browser playback for the generated MIDI file. */
    const handlePlayPreview = async () => {
        if (!downloadUrl || isLoadingPreview) return;

        /** Displays a recoverable browser-preview error. */
        const showPreviewError = (message: string) => {
            setPreviewError(message);
            toast({
                title: "MIDI preview unavailable",
                description: message,
                variant: "destructive",
            });
        };

        stopPreview();
        setPreviewError(null);
        setIsLoadingPreview(true);
        try {
            const player = new MidiAudioPlayer({
                // The player clamps its master gain to 1.0 and routes it through
                // an internal compressor/limiter, so this is the loudest safe
                // browser-preview setting rather than an uncontrolled boost.
                volume: 1.0,
                reverb: 0.18,
                eqPreset: "classical",
                preferred: ["FluidR3_GM"],
            });
            player.on("endOfFile", () => {
                setIsPlaying(false);
            });
            previewPlayerRef.current = player;
            const started = await player.play(downloadUrl);
            if (!started) {
                showPreviewError("Your browser prevented audio playback. Please try Play MIDI preview again.");
                await player.close();
                previewPlayerRef.current = null;
                return;
            }
            setIsPlaying(true);
        } catch (error) {
            stopPreview();
            const message = error instanceof Error ? error.message : "Could not start the MIDI preview.";
            showPreviewError(message);
        } finally {
            setIsLoadingPreview(false);
        }
    };
    
    return (
        <>
            {/* Generate Button */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-marble-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-classical-blue-800">
                        Generate MIDI
                    </h3>
                    <GenerationHistory/>
                </div>
                
                {/* Friendly Name Input */}
                <div className="mb-4">
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
                        placeholder="Enter a name for this MIDI generation request"
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This name will appear in your Downloads History
                    </p>
                </div>
                
                <Button
                    onClick={handleGenerateMidi}
                    disabled={generateMidiMutation.isPending}
                    className="w-full bg-classical-blue-700 hover:bg-classical-blue-800 text-white text-lg font-medium py-4"
                >
                    {generateMidiMutation.isPending ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-3 animate-spin"/>
                            Generating MIDI file...
                        </>
                    ) : (
                         <>
                             {getInstrumentIcon(settings?.instrument || "aulos")}
                             <span className="ml-3">Generate MIDI file</span>
                         </>
                     )}
                </Button>
            </div>
            
            {/* Status Panel */}
            {(
                 generateMidiMutation.isPending ||
                 generateMidiMutation.isSuccess ||
                 generateMidiMutation.isError
             ) && (
                 <div className="bg-white rounded-xl shadow-lg p-6 border border-marble-200">
                     {generateMidiMutation.isPending && (
                         <div className="text-center">
                             <div className="flex justify-center mb-4">
                                 <Loader2 className="h-12 w-12 text-classical-blue-700 animate-spin"/>
                             </div>
                             <p className="text-classical-blue-700 font-medium">
                                 Generating MIDI file...
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
                                 MIDI file generation successful!
                             </h3>
                             <p className="text-gray-600 mb-4">
                                 Your verses have been successfully converted to MIDI format.
                             </p>
                             
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Button
                                    onClick={isPlaying ? stopPreview : handlePlayPreview}
                                    disabled={!downloadUrl || isLoadingPreview}
                                    variant="outline"
                                    className="font-medium"
                                >
                                    {isLoadingPreview ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                    ) : isPlaying ? (
                                        <Square className="h-4 w-4 mr-2"/>
                                    ) : (
                                        <Play className="h-4 w-4 mr-2"/>
                                    )}
                                    {isPlaying ? "Stop preview" : "Play MIDI preview"}
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                                >
                                    <Download className="h-4 w-4 mr-2"/>
                                    Download MIDI file
                                </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <Button
                                    onClick={handleScoreDownload}
                                    disabled={!scoreDownloadUrl}
                                    variant="outline"
                                    className="flex-1 font-medium"
                                >
                                    <FileText className="h-4 w-4 mr-2"/>
                                    Download score (MusicXML)
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label="About the score export">
                                                <Info className="h-4 w-4"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-sm text-left">
                                            Application notation for all generated verses. It is not ancient notation or a
                                            scholarly transcription; MIDI pitch bends, microtonal adjustments, and complex
                                            overlapping ornamentation may not engrave exactly.
                                            Open this in notation software such as "MuseScore" to view, edit, or print the generated score.
                                            It is not intended for direct audio playback.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="text-xs text-gray-500 mt-3" style={{ textAlign: "left", fontSize: 12 }}>
                                Browser preview is a simplified listening aid and may sound different from the downloaded MIDI.
                                For the best result, open the download in capable music software: quality depends on its sound
                                library or installed soundfonts, and professional audio software with high-quality libraries can
                                sound substantially better than browser or default system playback. The downloaded MIDI is unchanged.
                            </p>
                            {previewError && (
                                <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                                    Preview unavailable: {previewError}
                                </p>
                            )}
                         </div>
                     )}
                     
                     {generateMidiMutation.isError && (
                         <div className="text-center">
                             <div className="flex justify-center mb-4">
                                 <div className="rounded-full bg-red-100 p-3">
                                     <AlertCircle className="h-8 w-8 text-red-600"/>
                                 </div>
                             </div>
                             <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                             <p className="text-red-600">
                                 {generateMidiMutation.error?.message ||
                                  "Please check your input format, and then try again."}
                             </p>
                         </div>
                     )}
                 </div>
             )}
        </>
    );
}
