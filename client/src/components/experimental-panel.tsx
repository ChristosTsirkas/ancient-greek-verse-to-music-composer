import {useState}                                                      from "react";
import {Label}                                                         from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Slider}                                                        from "@/components/ui/slider";
import {Card, CardContent, CardHeader, CardTitle}                      from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger}           from "@/components/ui/collapsible";
import {ChevronDown, Info}                                             from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger}      from "@/components/ui/tooltip";

interface ExperimentalOptions {
    rhythmModel:
        | "standard"
        | "chronos_ratios"
        | "heraclitean_pulse"
        | "euripidean_flow"
        | "delphic_paean"
        | "sapphic_lyric"
        | "nomos_apollonian"
        | "antiochene_scenic";
    tonos:
        | "none"
        | "dorian"
        | "phrygian"
        | "lydian"
        | "mixolydian"
        | "hypolydian"
        | "hypophrygian"
        | "hypodorian";
    genus: "diatonic" | "diatonic_soft" | "chromatic" | "chromatic_soft" | "chromatic_hemiolic" | "enharmonic" | "enharmonic_symmetric";
    baseUnit: number;
    tuningSystem: "equal_temperament" | "pythagorean";
    ethosMapping: boolean;
    noAccentFallback?: boolean;
    
    antiocheneFeatures?: {
        rhythmicCells:
            | "standard"
            | "dochmiac_paeon_cretic"
            | "paeon_cretic_iamb"
            | "tragic_meters"
            | "comic_meters";
        melismaticOrnamentation: boolean;
        antiphonalResponse: boolean;
        pantomimeLayer: boolean;
    };
}

type InterpretiveEthos =
    | "dorian"
    | "phrygian"
    | "lydian"
    | "mixolydian"
    | "aeolian"
    | "hypolydian"
    | "hypophrygian"
    | "hypodorian";

interface ExperimentalPanelProps {
    experimental: ExperimentalOptions;
    ethos: InterpretiveEthos;
    verses?: Array<{
        text: string;
        metrics: string;
        arsisThesisPattern?: string;
    }>;
    onUpdateExperimental: (experimental: ExperimentalOptions) => void;
    onUpdateEthos: (ethos: InterpretiveEthos) => void;
}

/** Renders optional experimental rhythm and tuning controls. */
export default function ExperimentalPanel({
                                              experimental,
                                              ethos,
                                              verses,
                                              onUpdateExperimental,
                                              onUpdateEthos,
                                          }: ExperimentalPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Check if any verse has arsis/thesis patterns
    const hasArsisThesisPatterns = verses?.some(
        (verse) =>
            verse.arsisThesisPattern && verse.arsisThesisPattern.trim() !== "",
    );
    
    // Use the actual genus value - backend handles arsis/thesis enforcement
    const effectiveGenus = experimental.genus;
    
    const rhythmModels = {
        standard:          "Standard metrical analysis",
        chronos_ratios:    "Aristoxenian Chronos ratios (foot-based)",
        heraclitean_pulse:
                           'Variable flow ("Heraclitean Pulse" - later theoretical construct)',
        euripidean_flow:   "Tragic dochmiac flow (interpretive)",
        delphic_paean:     "Delphic paeanic system (cretic-paeonic alternation)",
        sapphic_lyric:     "Sapphic aeolic meters (asymmetric lyrical)",
        nomos_apollonian:  "Nomos performance structure (multi-sectional)",
        antiochene_scenic: "Antiochene scenic listening model (interpretative)",
    };
    
    const tonosOptions = {
        none:         "None (no Ptolemaic transposition)",
        mixolydian:   "Mixolydian (highest Ptolemaic position)",
        lydian:       "Lydian",
        phrygian:     "Phrygian",
        dorian:       "Dorian (central Ptolemaic position)",
        hypolydian:   "Hypolydian",
        hypophrygian: "Hypophrygian",
        hypodorian:   "Hypodorian (lowest Ptolemaic position)",
    };
    const ethosOptions: Record<InterpretiveEthos, string> = {
        dorian:       "Dorian (brave, solemn)",
        phrygian:     "Phrygian (ecstatic, Dionysiac association)",
        lydian:       "Lydian (light, soft)",
        mixolydian:   "Mixolydian (lamenting, tragic)",
        aeolian:      "Aeolian (later theoretical construct)",
        hypolydian:   "Hypolydian (processional association)",
        hypophrygian: "Hypophrygian (later theoretical association)",
        hypodorian:   "Hypodorian (late-antique theatrical association)",
    };
    const pitchFramework = experimental.tonos === "none" ? "ethos" : "ptolemaic";
    
    const genusOptions = {
        diatonic:            "Diatonic (natural intervals)",
        diatonic_soft:       "Diatonic — soft shade (modern realization)",
        chromatic:           "Chromatic (intense semitones)",
        chromatic_soft:      "Chromatic — soft shade (modern realization)",
        chromatic_hemiolic:  "Chromatic — hemiolic shade (modern realization)",
        enharmonic:          "Enharmonic (micro-intervals)",
        enharmonic_symmetric: "Enharmonic — symmetric shade (modern realization)",
    };
    
    return (
        <Card className="border-amber-200 bg-amber-50">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-amber-100 transition-colors">
                        <CardTitle className="flex items-center justify-between text-amber-800">
                            Interpretative Options
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                    <CardContent className="space-y-6">
                        {/* Rhythm model */}
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label className="text-sm font-medium">
                                    Rhythm model preset (will auto-modify other options):
                                </Label>
                            </div>
                            <Select
                                value={experimental.rhythmModel}
                                onValueChange={(value: typeof experimental.rhythmModel) => {
                                    const newExperimental = {
                                        ...experimental,
                                        rhythmModel: value,
                                    };
                                    
                                    // Every rhythm-model preset uses the application's conservative
                                    // Pythagorean-fifths/diatonic listening baseline: 3:2 fifths
                                    // (see PROVENANCE, "Tuning: Pythagorean fifths") and Hagel,
                                    // Ancient Greek Music (2009), p.153, for tense diatonic. The
                                    // cited rhythm sources below support each model's rhythmic
                                    // material, not a reconstructed tuning-plus-genus pairing; see
                                    // PROVENANCE, "Rhythm-model listening presets".
                                    switch (value) {
                                        case "antiochene_scenic":
                                            newExperimental.tonos = "none";
                                            // Libanius, Choricius, and Lucian provide performance context only;
                                            // none specifies this pitch pairing (PROVENANCE, "Antiochene scenic
                                            // listening model: evidence and limits").
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "delphic_paean":
                                            newExperimental.tonos = "none";
                                            // West, Ancient Greek Music (1992), pp.140-142, supports the
                                            // paeonic rhythmic patterns, not a fixed pitch pairing.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "sapphic_lyric":
                                            newExperimental.tonos = "none";
                                            // West, Ancient Greek Music (1992), pp.148-150, supports the
                                            // Sapphic/Alcaic line timing, not a fixed pitch pairing.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "nomos_apollonian":
                                            newExperimental.tonos = "none";
                                            // West, Ancient Greek Music (1992), pp.211-213, supports the
                                            // Pythikos Nomos's five-section program, not a pitch pairing.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "euripidean_flow":
                                            newExperimental.tonos = "none";
                                            // West, Ancient Greek Music (1992), pp.142-144, supports the
                                            // dochmiac context; Pythagorean-plus-enharmonic is instead an
                                            // explicitly warned experimental synthesis.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "chronos_ratios":
                                            newExperimental.tonos = "none";
                                            // Aristoxenus, Elementa Rhythmica II.30, supports the rhythmic
                                            // ratios; it does not prescribe this pitch pairing.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // Focus on rhythm structure
                                            break;
                                        case "heraclitean_pulse":
                                            newExperimental.tonos = "none";
                                            // The pulse formula is an application feature, not an ancient
                                            // reconstruction; its pitch baseline is likewise a listening default.
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        case "standard":
                                            newExperimental.tonos = "none";
                                            newExperimental.tuningSystem = "pythagorean";
                                            newExperimental.genus = "diatonic";
                                            newExperimental.ethosMapping = false; // User can enable manually
                                            break;
                                        default:
                                            // Keep current selection if no optimal match
                                            break;
                                    }
                                    
                                    onUpdateExperimental(newExperimental);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(rhythmModels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {experimental.rhythmModel !== "standard" && (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                                    <strong>Auto-selection is active:</strong> a conservative,
                                    historically informed listening default: Pythagorean fifths
                                    plus diatonic genus. It does not claim that the selected
                                    rhythm model was historically performed in this exact pitch
                                    combination. The cited rhythmic basis and optional genus
                                    emulations are documented in the sources; manual adjustments
                                    are available below.
                                    {experimental.rhythmModel === "delphic_paean" && (
                                        <span className="block mt-1">
                      <strong>Delphic paeanic rhythm:</strong> West documents
                      the paeonic patterns; this pitch baseline is an application default.
                    </span>
                                    )}
                                    {experimental.rhythmModel === "antiochene_scenic" && (
                                        <span className="block mt-1">
                      <strong>Late Antique context:</strong> the associated
                      sources do not prescribe a tonos or genus for this preset.
                    </span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Base Unit for Aristoxenian chronos ratios. */}
                        {experimental.rhythmModel === "chronos_ratios" && (
                             <div className="space-y-2">
                                 <Label className="text-sm font-medium">
                                     Base Chronos unit: {experimental.baseUnit}ms
                                 </Label>
                                 <Slider
                                     value={[experimental.baseUnit]}
                                     onValueChange={(value) =>
                                         onUpdateExperimental({
                                                                  ...experimental,
                                                                  baseUnit: value[0],
                                                              })
                                     }
                                     min={100}
                                     max={1000}
                                     step={20}
                                     className="w-full"
                                 />
                                 <div className="text-xs text-gray-500">
                                     Short syllable (U) = {experimental.baseUnit}ms, Long syllable
                                     (-) = {experimental.baseUnit * 2}ms
                                 </div>
                             </div>
                         )}
                        
                        {/* Tuning System */}
                        <div className="space-y-2" style={{ display: "none" }}>
                            <div className="flex items-center">
                                <Label className="text-sm font-medium">
                                    Tempo tuning system:
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
                                            <p className="font-semibold text-sm">
                                                Pythagorean mathematical ratios vs modern equal
                                                temperament:
                                            </p>
                                            <p className="text-xs mt-1">
                                                Pythagorean tuning uses pure mathematical ratios (3:2,
                                                4:3), for harmony. Equal temperament is used in modern
                                                music, for practicality.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select
                                value={experimental.tuningSystem}
                                onValueChange={(value: typeof experimental.tuningSystem) =>
                                    onUpdateExperimental({
                                                             ...experimental,
                                                             tuningSystem: value,
                                                         })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equal_temperament">
                                        Equal temperament (modern)
                                    </SelectItem>
                                    <SelectItem value="pythagorean">
                                        Pythagorean ratios (ancient)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {experimental.tuningSystem === "pythagorean" && (
                                <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded border">
                                    <strong>Pythagorean ratios:</strong> Perfect 5th (3:2),
                                    Perfect 4th (4:3), Major 2nd (9:8). Compatible with all modes
                                    and rhythm models.
                                </div>
                            )}
                        </div>
                        
                        {/* Antiochene Scenic Features */}
                        {experimental.rhythmModel === "antiochene_scenic" && (
                            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="text-sm font-semibold text-purple-800 flex items-center">
                                    <span className="mr-2">🎭</span>
                                    Antiochene scenic features (3rd-6th c. AD)
                                </h4>
                                
                                {/* Rhythmic Cells */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Dramatic-metre modifier cycle (interpretative)
                                    </Label>
                                    <Select
                                        value={
                                            experimental.antiocheneFeatures?.rhythmicCells ||
                                            "standard"
                                        }
                                        onValueChange={(value) =>
                                            onUpdateExperimental({
                                                                     ...experimental,
                                                                     antiocheneFeatures: {
                                                                         ...experimental.antiocheneFeatures,
                                                                         rhythmicCells: value as any,
                                                                         melismaticOrnamentation:
                                                                                        experimental.antiocheneFeatures
                                                                                            ?.melismaticOrnamentation || false,
                                                                         antiphonalResponse:
                                                                                        experimental.antiocheneFeatures
                                                                                            ?.antiphonalResponse || false,
                                                                         pantomimeLayer:
                                                                                        experimental.antiocheneFeatures?.pantomimeLayer ||
                                                                                        false,
                                                                     },
                                                                 })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">
                                                Standard (no cell chaining)
                                            </SelectItem>
                                            <SelectItem value="dochmiac_paeon_cretic">
                                                Dochmiac-Paeon-Cretic modifier cycle (interpretative)
                                            </SelectItem>
                                            <SelectItem value="paeon_cretic_iamb">
                                                Paeon-Cretic-Iamb modifier cycle (interpretative)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Applies only to matching parsed feet: Dochmiac-Paeon-Cretic
                                        uses <code>U--U- UUU- -U-</code>; Paeon-Cretic-Iamb uses
                                        <code>-UUU -U- U-</code>. Other feet are unchanged.
                                    </p>
                                </div>
                                
                                {/* See PROVENANCE, "Antiochene scenic listening model:
                                    evidence and limits." These controls are interpretative
                                    listening options, not a reconstruction. */}
                                {/* Antiochene Feature Toggles */}
                                <div className="grid grid-cols-1 gap-3">
                                    <i>Experimental options:</i>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="melismaticOrnamentation"
                                            checked={
                                                experimental.antiocheneFeatures
                                                    ?.melismaticOrnamentation || false
                                            }
                                            onChange={(e) => {
                                                // When melismatic ornamentation is selected, disable all other options
                                                const newAntiocheneFeatures = {
                                                    rhythmicCells:
                                                        experimental.antiocheneFeatures?.rhythmicCells ||
                                                        "standard",
                                                    melismaticOrnamentation: e.target.checked,
                                                    antiphonalResponse:      e.target.checked
                                                                             ? false
                                                                             : experimental.antiocheneFeatures
                                                                                   ?.antiphonalResponse || false,
                                                    pantomimeLayer:          e.target.checked
                                                                             ? false
                                                                             : experimental.antiocheneFeatures?.pantomimeLayer ||
                                                                               false,
                                                };
                                                
                                                onUpdateExperimental({
                                                                         ...experimental,
                                                                         ethosMapping:       e.target.checked
                                                                                             ? false
                                                                                             : experimental.ethosMapping,
                                                                         antiocheneFeatures: newAntiocheneFeatures,
                                                                     });
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label
                                            htmlFor="melismaticOrnamentation"
                                            className="text-sm"
                                        >
                                            Melismatic ornamentation (interpretative)
                                            <br/>(<i>cannot be combined with below options</i>)
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
                                                    <p className="font-semibold text-sm">
                                                        General ancient melismatic precedent
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        An interpretative ornament layer; its precise
                                                        pitches and timing are not reconstructed.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="antiphonalResponse"
                                            checked={
                                                experimental.antiocheneFeatures?.antiphonalResponse ||
                                                false
                                            }
                                            onChange={(e) => {
                                                // When any other option is selected, disable melismatic ornamentation
                                                const newAntiocheneFeatures = {
                                                    rhythmicCells:
                                                        experimental.antiocheneFeatures?.rhythmicCells ||
                                                        "standard",
                                                    melismaticOrnamentation: e.target.checked
                                                                             ? false
                                                                             : experimental.antiocheneFeatures
                                                                                   ?.melismaticOrnamentation || false,
                                                    antiphonalResponse:      e.target.checked,
                                                    pantomimeLayer:
                                                        experimental.antiocheneFeatures?.pantomimeLayer ||
                                                        false,
                                                };
                                                
                                                onUpdateExperimental({
                                                                         ...experimental,
                                                                         antiocheneFeatures: newAntiocheneFeatures,
                                                                     });
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="antiphonalResponse" className="text-sm">
                                            Antiphonal response sections (interpretative)
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
                                                    <p className="font-semibold text-sm">
                                                        Ancient dramatic exchange and chorus
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        A theatrical listening model, not a documented
                                                        Antiochene response pattern.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="pantomimeLayer"
                                            checked={
                                                experimental.antiocheneFeatures?.pantomimeLayer || false
                                            }
                                            onChange={(e) => {
                                                // When pantomime layer is selected, disable melismatic ornamentation
                                                const newAntiocheneFeatures = {
                                                    rhythmicCells:
                                                        experimental.antiocheneFeatures?.rhythmicCells ||
                                                        "standard",
                                                    melismaticOrnamentation: e.target.checked
                                                                             ? false
                                                                             : experimental.antiocheneFeatures
                                                                                   ?.melismaticOrnamentation || false,
                                                    antiphonalResponse:
                                                        experimental.antiocheneFeatures
                                                            ?.antiphonalResponse || false,
                                                    pantomimeLayer:          e.target.checked,
                                                };
                                                
                                                onUpdateExperimental({
                                                                         ...experimental,
                                                                         antiocheneFeatures: newAntiocheneFeatures,
                                                                     });
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="pantomimeLayer" className="text-sm">
                                            Pantomime gesture/rhythm layer (interpretative)
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
                                                    <p className="font-semibold text-sm">
                                                        Libanius and ancient pantomime research
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Gesture, accompaniment, chorus, and pulse are
                                                        supported; this app's MIDI mapping is interpretative.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Ethos and tonos are historically distinct, alternative pitch approaches. */}
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label className="text-sm font-medium">
                                    Pitch approach:
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
                                            <p className="text-xs mt-1">
                                                <strong>Ptolemaic tonos</strong> (based on Ptolemy, Harmonics II.10–11)
                                                uses seven transposition positions, ordered around Dorian.
                                                Selecting one moves the whole pitch framework higher or
                                                lower while retaining the chosen genus.
                                                "Allow melody" is not required.
                                            </p>
                                            <p className="text-xs mt-1" style={{marginTop: "5pt"}}>
                                                <strong>Interpretive ethos</strong> uses qualitative
                                                character descriptions associated with names such as
                                                Dorian or Phrygian; they use an interpretive two-note realization
                                                "Allow melody" is required.
                                                
                                                <div style={{marginTop: "9pt"}}>Choose one approach: the systems cannot be combined.</div>
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select value={pitchFramework} onValueChange={(value: "ethos" | "ptolemaic") => onUpdateExperimental({...experimental, tonos: value === "ethos" ? "none" : "dorian"})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ptolemaic">Ptolemaic tonos</SelectItem>
                                    <SelectItem value="ethos">Interpretive ethos</SelectItem>
                                </SelectContent>
                            </Select>
                            {pitchFramework === "ethos" ? (
                                <>
                                    <Label className="text-sm font-medium">Interpretive ethos:</Label>
                                    <Select value={ethos} onValueChange={(value: InterpretiveEthos) => onUpdateEthos(value)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>{Object.entries(ethosOptions).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Qualitative ancient character descriptions; this app's two-note realization is interpretive.</p>
                                </>
                            ) : (
                                <>
                                    <Label className="text-sm font-medium">Ptolemaic tonos:</Label>
                                    <Select value={experimental.tonos} onValueChange={(value: typeof experimental.tonos) => onUpdateExperimental({...experimental, tonos: value})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>{Object.entries(tonosOptions).filter(([key]) => key !== "none").map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Ptolemy's technical transposition positions; not a psychological ethos setting.</p>
                                    {experimental.rhythmModel === "antiochene_scenic" && (
                                        <p className="text-xs text-amber-800">
                                            Exploratory combination: Ptolemaic tonos theory is attested, but this pairing with Antiochene scenic music is not.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Genus */}
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label className="text-sm font-medium">
                                    Genus (interval type):
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
                                            <p className="font-semibold text-sm">
                                                Pseudo-Plutarch, De Musica
                                            </p>
                                            <p className="text-xs mt-1">
                                                Diatonic, chromatic, and enharmonic genera create
                                                different interval flavors.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select
                                value={effectiveGenus}
                                onValueChange={(value: typeof experimental.genus) =>
                                    onUpdateExperimental({
                                                             ...experimental,
                                                             genus: value,
                                                         })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(genusOptions).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Archytas: Ptolemy, Harmonics I.13 and II.13-14;
                                symmetric enharmonic: Hagel, Ancient Greek Music
                                (2009), p.153. Neither microinterval realization
                                is presented here as an attested layer on a
                                Pythagorean fifths framework. */}
                            {experimental.tuningSystem === "pythagorean" &&
                             ["enharmonic", "enharmonic_symmetric"].includes(experimental.genus) && (
                                 <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-300">
                                     <strong>Experimental synthesis:</strong> Pythagorean
                                     tuning plus the selected enharmonic microinterval
                                     realization is not an attested ancient combination.
                                     It remains available for exploration.
                                 </div>
                             )}
                            {hasArsisThesisPatterns && (
                                <div className="text-xs text-blue-600 mt-1">
                                    The enharmonic genus is always applied for arsis/thesis
                                    quarter-tone bends.
                                </div>
                            )}
                        </div>
                        
                        <div
                            className="text-xs text-amber-700 bg-amber-100 p-3 rounded border border-amber-300"
                            style={{ lineHeight: "1" }}
                        >
                            The options on this panel reflect my own interpretations of ancient, primary sources
                            (Aristoxenus, Alypios, Pseudo-Plutarch, etc.) and of modern scholarship on ancient Greek musical theory,
                            including scholarly reconstructions where ancient evidence is incomplete.
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
