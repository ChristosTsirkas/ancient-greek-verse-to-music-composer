import {useEffect, useState}                                       from "react";
import {Button}                                                    from "@/components/ui/button";
import {Checkbox}                                                  from "@/components/ui/checkbox";
import {Label}                                                     from "@/components/ui/label";
import {Card, CardContent}                                         from "@/components/ui/card";
import {Info}                                                      from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface ArsisThesisMapperProps {
    verse: { text: string; metrics: string; arsisThesisPattern?: string };
    onPatternChange: (pattern: string | undefined) => void;
    onGenusChange?: (genus: "enharmonic" | "diatonic") => void;
    experimental?: {
        noAccentFallback?: boolean;
    };
    onUpdateExperimental?: (updates: {
        noAccentFallback?: boolean;
    }) => void;
}

/** Maps each metrical element to arsis or thesis. */
export default function ArsisThesisMapper({
                                              verse,
                                              onPatternChange,
                                              onGenusChange,
                                              experimental,
                                              onUpdateExperimental,
                                          }: ArsisThesisMapperProps) {
    const [isEnabled, setIsEnabled] = useState(!!verse.arsisThesisPattern);
    const [syllableStates, setSyllableStates] = useState<Array<"A" | "T" | null>>(
        [],
    );
    
    // Extract syllables from verse text, supporting both space and hyphen separation
    const extractSyllables = (text: string): string[] => {
        return text
        .replace(/[—–−]/g,
                 "-") // Normalize dashes
        .split(/[\s-]+/) // Split by spaces or hyphens
        .filter((syllable) => syllable.trim().length > 0);
    };
    
    const syllables = extractSyllables(verse.text);
    
    useEffect(() => {
                  if (verse.arsisThesisPattern) {
                      const pattern = verse.arsisThesisPattern.split("-");
                      setSyllableStates(
                          pattern.map((p) => (
                              p === "A" ? "A" : p === "T" ? "T" : null
                          )),
                      );
                      setIsEnabled(true);
                  } else {
                      setSyllableStates(new Array(syllables.length).fill(null));
                      setIsEnabled(false);
                  }
              },
              [verse.arsisThesisPattern, syllables.length]);
    
    /** Enables or disables the arsis/thesis mapping mode. */
    const handleToggleEnable = (enabled: boolean) => {
        setIsEnabled(enabled);
        if (!enabled) {
            setSyllableStates(new Array(syllables.length).fill(null));
            onPatternChange(undefined);
            onGenusChange?.("diatonic"); // Reset to diatonic when disabled
        } else {
            onGenusChange?.("enharmonic"); // Set to enharmonic when enabled
        }
    };
    
    /** Sets or clears the arsis/thesis value for one metrical element. */
    const handleSyllableClick = (index: number, type: "A" | "T") => {
        const newStates = [...syllableStates];
        
        if (newStates[index] === type) {
            // Click again - release state
            newStates[index] = null;
        } else {
            // Set new state (automatically disables the other)
            newStates[index] = type;
        }
        
        setSyllableStates(newStates);
        
        // Update pattern string
        const hasAllMarked = newStates.every((state) => state !== null);
        if (hasAllMarked) {
            const patternString = newStates.join("-");
            onPatternChange(patternString);
        } else {
            onPatternChange(undefined);
        }
    };
    
    if (syllables.length === 0) return null;
    
    return (
        <Card className="mt-4">
            <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                        id="enable-arsis-thesis"
                        checked={isEnabled}
                        onCheckedChange={handleToggleEnable}
                    />
                    <Label
                        htmlFor="enable-arsis-thesis"
                        className="text-sm font-medium cursor-pointer"
                    >
                        Enable Arsis/Thesis pattern (choreographic rhythm)
                    </Label>
                </div>
                
                {isEnabled && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="noAccentFallback"
                                    checked={experimental?.noAccentFallback || false}
                                    onChange={(e) =>
                                        onUpdateExperimental?.({
                                                                   ...experimental,
                                                                   noAccentFallback: e.target.checked,
                                                               })
                                    }
                                    className="rounded border-gray-300"
                                />
                                    <Label
                                        htmlFor="noAccentFallback"
                                    className="text-sm"
                                >
                                    Disable arsis/thesis pitch marking entirely
                                </Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="ml-1 inline-flex items-center justify-center rounded-full w-4 h-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                <Info className="h-3 w-3"/>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs p-3">
                                            <p className="text-sm">
                                                Removes the default pitch difference entirely - arsis and
                                                thesis get no pitch or volume distinction at all,
                                                duration and melody follow the selected rhythm model
                                                only.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                            Click "A" (above) for Arsis ("lifting") or "T" (below) for Thesis
                            ("setting down"), for each syllable. Both must be marked, for all
                            syllables to generate the MIDI file.
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {syllables.map((syllable, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center space-y-1"
                                >
                                    {/* Arsis button (above) */}
                                    <Button
                                        variant={
                                            syllableStates[index] === "A" ? "default" : "outline"
                                        }
                                        size="sm"
                                        className={`w-8 h-6 text-xs ${
                                            syllableStates[index] === "A"
                                            ? "bg-blue-500 text-white"
                                            : "hover:bg-blue-100"
                                        }`}
                                        onClick={() => handleSyllableClick(index,
                                                                           "A")}
                                    >
                                        A
                                    </Button>
                                    
                                    {/* Syllable text */}
                                    <div
                                        className="px-2 py-1 bg-gray-50 rounded text-sm font-medium min-w-[40px] text-center">
                                        {syllable}
                                    </div>
                                    
                                    {/* Thesis button (below) */}
                                    <Button
                                        variant={
                                            syllableStates[index] === "T" ? "default" : "outline"
                                        }
                                        size="sm"
                                        className={`w-8 h-6 text-xs ${
                                            syllableStates[index] === "T"
                                            ? "bg-red-500 text-white"
                                            : "hover:bg-red-100"
                                        }`}
                                        onClick={() => handleSyllableClick(index,
                                                                           "T")}
                                    >
                                        T
                                    </Button>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pattern preview */}
                        {syllableStates.some((state) => state !== null) && (
                            <div className="mt-4 p-2 bg-gray-50 rounded">
                                <div className="text-xs font-medium mb-1">Current Pattern:</div>
                                <div className="text-sm font-mono">
                                    {syllableStates.map((state) => state || "?").join("-")}
                                </div>
                                {!syllableStates.every((state) => state !== null) && (
                                    <div className="text-xs text-amber-600 mt-1">
                                        ⚠ All syllables must be marked, to enable MIDI generation.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
