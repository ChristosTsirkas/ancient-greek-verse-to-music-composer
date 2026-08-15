import {Label}                                                                      from "@/components/ui/label";
import {Switch}                                                                     from "@/components/ui/switch";
import {Checkbox}                                                                   from "@/components/ui/checkbox";
import {RadioGroup, RadioGroupItem}                                                 from "@/components/ui/radio-group";
import {Slider}                                                                     from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue}              from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger}                   from "@/components/ui/tooltip";
import {Bell, Disc3, Drum, Hand, HandMetal, Info, Music, Volume2, Waves, Wind, Zap} from "lucide-react";
import ExperimentalPanel                                                            from "./experimental-panel";

interface SettingsPanelProps {
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
        includeAccentTrack?: boolean;
        includeVocalGuide?: boolean;
        outputFormat: "midi" | "wav";
        allowMelody?: boolean;
        experimental: {
            rhythmModel:
                | "standard"
                | "chronos_ratios"
                | "heraclitean_pulse"
                | "euripidean_flow";
            tonos: "none" | "dorian" | "phrygian" | "lydian" | "mixolydian" | "hypolydian" | "hypophrygian" | "hypodorian";
            genus: "diatonic" | "chromatic" | "enharmonic";
            baseUnit: number;
            tuningSystem: "equal_temperament" | "pythagorean";
            ethosMapping: boolean;
            antiocheneFeatures: {
                rhythmicCells:
                    | "standard"
                    | "dochmiac_paeon_cretic"
                    | "paeon_cretic_iamb"
                    | "custom_chain";
                melismaticOrnamentation: boolean;
                antiphonalResponse: boolean;
                pantomimeLayer: boolean;
            };
        };
    };
    verses?: Array<{
        text: string;
        metrics: string;
        arsisThesisPattern?: string;
    }>;
    onUpdateSettings: (settings: {
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
        includeAccentTrack?: boolean;
        includeVocalGuide?: boolean;
        outputFormat: "midi" | "wav";
        allowMelody?: boolean;
        experimental: {
            rhythmModel:
                | "standard"
                | "chronos_ratios"
                | "heraclitean_pulse"
                | "euripidean_flow";
            tonos: "none" | "dorian" | "phrygian" | "lydian" | "mixolydian" | "hypolydian" | "hypophrygian" | "hypodorian";
            genus: "diatonic" | "chromatic" | "enharmonic";
            baseUnit: number;
            tuningSystem: "equal_temperament" | "pythagorean";
            ethosMapping: boolean;
            antiocheneFeatures: {
                rhythmicCells:
                    | "standard"
                    | "dochmiac_paeon_cretic"
                    | "paeon_cretic_iamb"
                    | "custom_chain";
                melismaticOrnamentation: boolean;
                antiphonalResponse: boolean;
                pantomimeLayer: boolean;
            };
        };
    }) => void;
}

/** Renders composition, instrument, and output settings. */
export default function SettingsPanel({
                                          settings,
                                          verses,
                                          onUpdateSettings,
                                      }: SettingsPanelProps) {
    const updateInstrument = (
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
            | "hand_clap_strong",
    ) => {
        onUpdateSettings({
                             ...settings,
                             instrument,
                         });
    };
    
    /** Updates the selected tempo from the slider value. */
    const updateTempo = (tempo: number[]) => {
        onUpdateSettings({
                             ...settings,
                             tempo: tempo[0],
                         });
    };
    
    /** Updates the Pythagorean tuning option. */
    const updatePythagoreanTuning = (pythagoreanTuning: boolean) => {
        onUpdateSettings({
                             ...settings,
                             experimental: {
                                 ...settings.experimental,
                                 tuningSystem: pythagoreanTuning ? "pythagorean" : "equal_temperament",
                             },
                         });
    };
    
    const updateMode = (
        mode:
            | "dorian"
            | "phrygian"
            | "lydian"
            | "mixolydian"
            | "aeolian"
            | "hypolydian"
            | "hypophrygian"
            | "hypodorian",
    ) => {
        onUpdateSettings({
                             ...settings,
                             mode,
                             allowMelody:  true,
                         });
    };
    
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
            <IconComponent className="h-4 w-4 text-classical-blue-600"/>
        ) : (
                   <Music className="h-4 w-4 text-classical-blue-600"/>
               );
    };
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-marble-200">
            <h2 className="text-xl font-classical font-semibold text-classical-blue-800 mb-4 flex items-center">
                <Music className="text-greek-gold-500 mr-3"/>
                Audio generation settings
            </h2>
            
            <div className="space-y-6">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Ancient greek theatrical instruments:
                    </Label>
                    <div className="max-h-64 overflow-y-auto pr-2">
                        <RadioGroup
                            value={settings.instrument}
                            onValueChange={updateInstrument}
                            className="space-y-2"
                        >
                            {/* Wind Instruments */}
                            <div className="text-xs font-semibold text-classical-blue-600 mt-3 mb-2">
                                Wind instruments
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="aulos" id="aulos"/>
                                <Label htmlFor="aulos" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("aulos")}
                                        <div className="font-medium text-classical-blue-700">
                                            Aulos
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Double-reed wind instrument, primary melodic voice.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="syrinx" id="syrinx"/>
                                <Label htmlFor="syrinx" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("syrinx")}
                                        <div className="font-medium text-classical-blue-700">
                                            Syrinx
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        "Pan flute", with multiple reed pipes, pastoral melodies.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="salpinx" id="salpinx"/>
                                <Label htmlFor="salpinx" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("salpinx")}
                                        <div className="font-medium text-classical-blue-700">
                                            Salpinx
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Bronze trumpet, for military/ceremonial scenes.
                                    </div>
                                </Label>
                            </div>
                            
                            {/* String Instruments */}
                            <div className="text-xs font-semibold text-classical-blue-600 mt-3 mb-2">
                                String instruments
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="lyra" id="lyra"/>
                                <Label htmlFor="lyra" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("lyra")}
                                        <div className="font-medium text-classical-blue-700">
                                            Lyra
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Seven-stringed lyre, accompaniment instrument.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="kithara" id="kithara"/>
                                <Label htmlFor="kithara" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("kithara")}
                                        <div className="font-medium text-classical-blue-700">
                                            Kithara
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Concert lyre, larger and more resonant than lyra.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="phorminx" id="phorminx"/>
                                <Label htmlFor="phorminx" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("phorminx")}
                                        <div className="font-medium text-classical-blue-700">
                                            Phorminx
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Archaic four-stringed lyre, Homeric epic instrument.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="pandura" id="pandura"/>
                                <Label htmlFor="pandura" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("pandura")}
                                        <div className="font-medium text-classical-blue-700">
                                            Pandura
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Long-necked lute, three-stringed ancestor of guitar.
                                    </div>
                                </Label>
                            </div>
                            
                            {/* Percussion Instruments */}
                            <div className="text-xs font-semibold text-classical-blue-600 mt-3 mb-2">
                                Percussion Instruments
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="tympanon" id="tympanon"/>
                                <Label htmlFor="tympanon" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("tympanon")}
                                        <div className="font-medium text-classical-blue-700">
                                            Tympanon
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Frame drum, for Dionysiac and emotional scenes.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="krotala" id="krotala"/>
                                <Label htmlFor="krotala" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("krotala")}
                                        <div className="font-medium text-classical-blue-700">
                                            Krotala
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Wooden clappers/castanets, for rhythmic marking.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="kymbala" id="kymbala"/>
                                <Label htmlFor="kymbala" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("kymbala")}
                                        <div className="font-medium text-classical-blue-700">
                                            Kymbala
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Bronze cymbals, for climactic moments.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="sistrum" id="sistrum"/>
                                <Label htmlFor="sistrum" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {getInstrumentIcon("sistrum")}
                                        <div className="font-medium text-classical-blue-700">
                                            Sistrum
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Metal rattle with rings, with egyptian influence.
                                    </div>
                                </Label>
                            </div>
                            
                            {/* Sound Effects */}
                            <div className="text-xs font-semibold text-classical-blue-600 mt-3 mb-2">
                                Theatrical sound effects
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="rhoptron" id="rhoptron"/>
                                <Label htmlFor="rhoptron" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-classical-blue-700">
                                        Rhoptron
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Whirring device, for wind/supernatural effects.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="keraunoskopion" id="keraunoskopion"/>
                                <Label
                                    htmlFor="keraunoskopion"
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium text-classical-blue-700">
                                        Keraunoskopeion
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Thunder machine, for Zeus/thunder/storm scenes.
                                    </div>
                                </Label>
                            </div>
                            
                            {/* Human Sounds */}
                            <div className="text-xs font-semibold text-classical-blue-600 mt-3 mb-2">
                                Human percussion
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem value="hand_clap_light" id="hand_clap_light"/>
                                <Label
                                    htmlFor="hand_clap_light"
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium text-classical-blue-700">
                                        Hand clapping (light)
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Gentle rhythmic accompaniment.
                                    </div>
                                </Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 p-3 border border-marble-300 rounded-lg hover:bg-marble-50">
                                <RadioGroupItem
                                    value="hand_clap_strong"
                                    id="hand_clap_strong"
                                />
                                <Label
                                    htmlFor="hand_clap_strong"
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium text-classical-blue-700">
                                        Hand clapping (strong)
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Emphatic rhythmic marking by the Chorus.
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                
                <div style={{ display: "none" }}>
                    <Label className="text-sm font-medium">Tempo tuning system:</Label>
                    
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
                                    Pythagorean mathematical ratios vs modern equal temperament:
                                </p>
                                <p className="text-xs mt-1">
                                    Pythagorean tuning uses pure mathematical ratios, for harmony:
                                    Perfect 5th (3:2), Perfect 4th (4:3), Major 2nd (9:8). Equal
                                    temperament is the standard tuning system in modern music,
                                    with 12 equal semitones per octave (12-TET), for practicality.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {/* Pythagorean Tuning Checkbox */}
                    <div
                        className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <Checkbox
                            id="pythagorean-tuning"
                            checked={settings.experimental.tuningSystem === "pythagorean"}
                            onCheckedChange={updatePythagoreanTuning}
                            className="data-[state=checked]:bg-classical-blue-600 data-[state=checked]:border-classical-blue-600"
                        />
                        <Label
                            htmlFor="pythagorean-tuning"
                            className="text-sm font-medium text-classical-blue-800 cursor-pointer"
                        >
                            Use Pythagorean tuning
                        </Label>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                        Authentic ancient Greek mathematical frequency ratios, for precise
                        microtonal intervals.
                    </p>
                    
                    <div className="space-y-2">
                        <Slider
                            value={[settings.tempo]}
                            onValueChange={updateTempo}
                            min={60}
                            max={200}
                            step={1}
                            className="w-full"
                            disabled={settings.experimental.tuningSystem === "pythagorean"}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>60 BPM</span>
                            <span className="font-medium text-classical-blue-700">
                {settings.tempo} BPM
              </span>
                            <span>200 BPM</span>
                        </div>
                        {settings.experimental.tuningSystem === "pythagorean" && (
                            <p className="text-xs text-amber-700 font-medium">
                                BPM disabled; using Pythagorean-based mathematical frequency
                                ratios instead.
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Interpretative Options */}
                <ExperimentalPanel
                    experimental={settings.experimental as any}
                    ethos={settings.mode}
                    verses={verses}
                    onUpdateEthos={updateMode}
                    onUpdateExperimental={(experimental) =>
                        onUpdateSettings({
                            ...settings,
                            experimental: experimental as any,
                            // The primary selector is Ptolemaic tonos; the
                            // interpretive ethos path remains optional.
                        })
                    }
                />
                
                <div style={{ display: "none" }}>
                    <Label className="text-sm font-medium">Interpretive ethos:</Label>
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
                                    Each mode carries specific emotional character (ethos) in
                                    Greek musical theory and worldview, according to the theories
                                    of ancient Greek melodic construction, and per my own
                                    interpretation of these theories. Thus, this option is
                                    experimental and interpretive.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-gray-500" style={{ fontWeight: 400 }}>
                        Qualitative source context, not an ancient numerical scale.
                    </div>
                    <Select value={settings.mode} onValueChange={updateMode}>
                        <SelectTrigger className="w-full">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dorian">Dorian (brave, solemn)</SelectItem>
                            <SelectItem value="phrygian">
                                Phrygian (ecstatic, associated with Dionysiac rites)
                            </SelectItem>
                            <SelectItem value="lydian">
                                Lydian (light, exalted, soft, effeminate)
                            </SelectItem>
                            <SelectItem value="mixolydian">
                                Mixolydian (for lamenting characters, tragic, per Plato)
                            </SelectItem>
                            <SelectItem value="aeolian">
                                Aeolian (dark, mysterious - later theoretical construct)
                            </SelectItem>
                            <SelectItem value="hypolydian">
                                Hypolydian (Delphic Hymns, processional, ritual)
                            </SelectItem>
                            <SelectItem value="hypophrygian">
                                Hypophrygian (Octoechos prototype, melismatic, ornamental)
                            </SelectItem>
                            <SelectItem value="hypodorian">
                                Hypodorian (late antique, theatrical, dramatic)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <div className="flex items-center mb-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Allow melody
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
                                        Enables creation of more melodic music, per modern
                                        theories of ancient Greek melodic construction, and per my
                                        own interpretation of these theories. Thus, this option is
                                        experimental and interpretive. Mostly speculative,
                                        when combined with arsis and thesis.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                        <Switch
                            checked={settings.allowMelody || false}
                            onCheckedChange={(checked) =>
                                onUpdateSettings({
                                                     ...settings,
                                                     allowMelody: checked,
                                                 })
                            }
                        />
                        <span className="text-sm text-gray-500">
              Enable melodic variation.
            </span>
                    </div>
                </div>
                
                {/* Additional Tracks */}
                <div>
                    <Label className="text-sm font-small text-gray-700 mb-3 block">
                        Helper overlay tracks:
                        <div className="text-xs text-gray-500" style={{ fontWeight: 400 }}>
                            Does not work with arsis and thesis patterns.
                        </div>
                    </Label>
                    
                    {/* Metronome Track */}
                    <div className="flex items-center space-x-2 mb-3">
                        <Switch
                            checked={settings.includeMetronome}
                            onCheckedChange={(checked) =>
                                onUpdateSettings({
                                                     ...settings,
                                                     includeMetronome: checked,
                                                 })
                            }
                        />
                        <span className="text-sm text-gray-500">
              Metronome track, for vocal overlay reference.
            </span>
                    </div>
                    
                    {/* Accent Track */}
                    <div className="flex items-center space-x-2 mb-3">
                        <Switch
                            checked={settings.includeAccentTrack || false}
                            onCheckedChange={(checked) =>
                                onUpdateSettings({
                                                     ...settings,
                                                     includeAccentTrack: checked,
                                                 })
                            }
                        />
                        <span className="text-sm text-gray-500">
              Accent track, for metrical emphasis.
            </span>
                    </div>
                    
                    {/* Vocal Guide Track */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={settings.includeVocalGuide || false}
                            onCheckedChange={(checked) =>
                                onUpdateSettings({
                                                     ...settings,
                                                     includeVocalGuide: checked,
                                                 })
                            }
                        />
                        <span className="text-sm text-gray-500">
              Vocal guide track, for performance reference.
            </span>
                    </div>
                </div>
                
                {/* Output Format */}
                <div style={{ display: "none" }}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Output format:
                    </Label>
                    <Select
                        value={settings.outputFormat}
                        onValueChange={(value: "midi" | "wav") =>
                            onUpdateSettings({
                                                 ...settings,
                                                 outputFormat: value,
                                             })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="midi">MIDI (.mid)</SelectItem>
                            <SelectItem value="wav">
                                WAV Audio (.wav) - Coming Soon
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {settings.outputFormat === "wav" && (
                        <p className="text-xs text-amber-600 mt-1">
                            WAV export is still under development. For now, please use MIDI
                            export.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
