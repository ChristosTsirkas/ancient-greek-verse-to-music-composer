import {Button}          from "@/components/ui/button";
import {Input}           from "@/components/ui/input";
import {Label}           from "@/components/ui/label";
import {Plus, Trash2}    from "lucide-react";
import ArsisThesisMapper from "./arsis-thesis-mapper";

interface VerseInputFormProps {
    verses: Array<{ text: string; metrics: string; arsisThesisPattern?: string }>;
    onAddVerse: () => void;
    onRemoveVerse: (index: number) => void;
    onUpdateVerse: (
        index: number,
        field: "text" | "metrics" | "arsisThesisPattern",
        value: string | undefined,
    ) => void;
    onGenusChange?: (genus: "enharmonic" | "diatonic") => void;
    settings: {
        instrument:
            | "aulos"
            | "syrinx"
            | "lyra"
            | "kithara"
            | "phorminx"
            | "pandura"
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
        mode:
            | "dorian"
            | "phrygian"
            | "lydian"
            | "mixolydian"
            | "aeolian"
            | "hypolydian"
            | "hypophrygian"
            | "hypodorian";
        includeMetronome: boolean;
        outputFormat: "midi" | "wav";
        experimental?: {
            noAccentFallback?: boolean;
            [key: string]: any;
        };
    };
    onUpdateExperimental?: (updates: {
        noAccentFallback?: boolean;
    }) => void;
}

/** Renders one editable verse and its metrical analysis controls. */
export default function VerseInputForm({
                                           verses,
                                           onAddVerse,
                                           onRemoveVerse,
                                           onUpdateVerse,
                                           onGenusChange,
                                           settings,
                                           onUpdateExperimental,
                                       }: VerseInputFormProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-marble-200">
            <h2 className="text-2xl font-classical font-semibold text-classical-blue-800 mb-6 flex items-center">
                <i className="fas fa-feather-alt mr-3">Verse Input</i>
            </h2>
            
            <div className="space-y-6">
                {verses.map((verse, index) => (
                    <div
                        key={index}
                        className="p-4 bg-marble-50 rounded-lg border border-marble-200"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-classical-blue-700 flex items-center">
                <span
                    className="bg-classical-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  {index + 1}
                </span>
                                Verse {index + 1}
                            </h3>
                            {verses.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveVerse(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-1"/>
                                    Remove verse
                                </Button>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <Label
                                    htmlFor={`verse-text-${index}`}
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Text:
                                </Label>
                                <Input
                                    id={`verse-text-${index}`}
                                    value={verse.text}
                                    onChange={(e) => onUpdateVerse(index,
                                                                   "text",
                                                                   e.target.value)}
                                    placeholder="Enter the text (e.g., Ζεὺς μὲν ἀ-φίκ-τωρ ἐ-πί-δοι προ-φρό-νως)"
                                    className="mt-2 font-greek text-lg"
                                />
                            </div>
                            
                            <div>
                                <Label
                                    htmlFor={`verse-metrics-${index}`}
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Metrical pattern:
                                </Label>
                                <Input
                                    id={`verse-metrics-${index}`}
                                    value={verse.metrics}
                                    onChange={(e) =>
                                        onUpdateVerse(index,
                                                      "metrics",
                                                      e.target.value)
                                    }
                                    placeholder="Enter metrics (e.g., - UU- - UU- UU-)"
                                    className="mt-2 font-mono text-lg"
                                />
                            </div>
                            
                            {/* Arsis/Thesis Pattern Mapper */}
                            <ArsisThesisMapper
                                verse={verse}
                                onPatternChange={(pattern) =>
                                    onUpdateVerse(index,
                                                  "arsisThesisPattern",
                                                  pattern)
                                }
                                onGenusChange={onGenusChange}
                                experimental={settings?.experimental}
                                onUpdateExperimental={onUpdateExperimental}
                            />
                        </div>
                    </div>
                ))}
                
                <Button
                    type="button"
                    onClick={onAddVerse}
                    className="w-full bg-greek-gold-500 hover:bg-greek-gold-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-2"/>
                    Add another verse
                </Button>
            </div>
        </div>
    );
}
