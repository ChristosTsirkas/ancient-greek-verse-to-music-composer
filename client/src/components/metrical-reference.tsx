import {useState}               from "react";
import {Button}                 from "@/components/ui/button";
import {ChevronDown, ChevronUp} from "lucide-react";

/** Displays a reference guide to supported metrical patterns. */
export default function MetricalReference() {
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const basicPatterns = [
        {
            symbol:      "U",
            name:        "Short syllable (breve)",
            description: "Duration: 0.5 beats",
        },
        {
            symbol:      "-",
            name:        "Long syllable (longum)",
            description: "Duration: 1.0 beat",
        },
        {
            symbol:      "X",
            name:        "Anceps (free position)",
            description: "Can be long or short",
        },
        { symbol:        "UU-",
            name:        "Anapaest",
            description: "Rising triple meter",
        },
        { symbol:        "-UU",
            name:        "Dactyl",
            description: "Falling triple meter",
        },
        { symbol:        "U-",
            name:        "Iamb",
            description: "Rising duple meter",
        },
        { symbol:        "-U",
            name:        "Trochee",
            description: "Falling duple meter",
        },
        { symbol:        "--",
            name:        "Spondee",
            description: "Two long syllables",
        },
    ];
    
    const advancedPatterns = [
        {
            category: "Three-syllable feet",
            patterns: [
                { symbol:        "U-U",
                    name:        "Amphibrach",
                    description: "Short-long-short",
                },
                { symbol:        "-U-",
                    name:        "Cretic",
                    description: "Long-short-long",
                },
                { symbol:        "UUU",
                    name:        "Tribrach",
                    description: "Three short",
                },
                { symbol:        "---",
                    name:        "Molossus",
                    description: "Three long",
                },
            ],
        },
        {
            category: "Four-syllable feet",
            patterns: [
                {
                    symbol:      "-UUU",
                    name:        "First Paeon",
                    description: "One long, three short",
                },
                {
                    symbol:      "U-UU",
                    name:        "Second Paeon",
                    description: "Long in second position",
                },
                {
                    symbol:      "UU-U",
                    name:        "Third Paeon",
                    description: "Long in third position",
                },
                {
                    symbol:      "UUU-",
                    name:        "Fourth Paeon",
                    description: "Long in fourth position",
                },
                {
                    symbol:      "-UU-",
                    name:        "Choriamb",
                    description: "Long-short-short-long",
                },
                {
                    symbol:      "UU--",
                    name:        "Ionic a minore",
                    description: "Two short, two long",
                },
                {
                    symbol:      "--UU",
                    name:        "Ionic a maiore",
                    description: "Two long, two short",
                },
            ],
        },
        {
            category: "Complex feet",
            patterns: [
                {
                    symbol:      "U--U-",
                    name:        "Dochmiac",
                    description: "Emotional meter in tragedy",
                },
                {
                    symbol:      "U---U",
                    name:        "Dochmiac (alternate)",
                    description: "Emotional meter in tragedy",
                },
                {
                    symbol:      "UUU-U-",
                    name:        "Dochmiac (resolved)",
                    description: "First long note split into two shorts",
                },
                {
                    symbol:      "UUUU",
                    name:        "Proceleusmatic",
                    description: "Four short syllables",
                },
                {
                    symbol:      "U---",
                    name:        "First Epitrite",
                    description: "One short, three long",
                },
            ],
        },
        {
            category: "Anceps patterns",
            patterns: [
                {
                    symbol:      "X-",
                    name:        "Anceps + Long",
                    description: "Free position plus long",
                },
                {
                    symbol:      "UX",
                    name:        "Short + Anceps",
                    description: "Short plus free position",
                },
                {
                    symbol:      "XX",
                    name:        "Double Anceps",
                    description: "Two free positions",
                },
            ],
        },
    ];
    
    return (
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6 border border-marble-200">
            <h2 className="text-2xl font-classical font-semibold text-classical-blue-800 mb-6 flex items-center">
                <i className="fas fa-book-open mr-3">Metrical pattern reference</i>
            </h2>
            
            {/* Basic Patterns */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-classical-blue-700 mb-4">
                    Essential patterns
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {basicPatterns.map((pattern, index) => (
                        <div
                            key={index}
                            className="bg-marble-50 p-4 rounded-lg border border-marble-200 w-full"
                        >
                            <div className="text-center">
                                <div className="text-xl font-bold text-classical-blue-700 mb-1 font-mono">
                                    {pattern.symbol}
                                </div>
                                <div className="text-sm font-medium text-gray-800">
                                    {pattern.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {pattern.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Advanced Patterns Toggle */}
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-center"
                >
                    {showAdvanced ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-2"/>
                            Hide advanced metrical patterns
                        </>
                    ) : (
                         <>
                             <ChevronDown className="h-4 w-4 mr-2"/>
                             Show advanced metrical patterns
                         </>
                     )}
                </Button>
            </div>
            
            {/* Advanced Patterns */}
            {showAdvanced && (
                <div className="space-y-6 mb-6">
                    {advancedPatterns.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                            <h4 className="text-md font-semibold text-classical-blue-700 mb-3">
                                {category.category}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {category.patterns.map((pattern, index) => (
                                    <div
                                        key={index}
                                        className="bg-classical-blue-50 p-4 rounded-lg border border-classical-blue-200 w-full"
                                    >
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-classical-blue-700 mb-1 font-mono">
                                                {pattern.symbol}
                                            </div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {pattern.name}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {pattern.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Example */}
            <div className="bg-greek-gold-50 p-4 rounded-lg border border-greek-gold-200">
                <h3 className="font-semibold text-classical-blue-800 mb-2 flex items-center">
                    <i className="fas fa-scroll text-greek-green-500 mr-2">
                        Example from Aeschylus (anapaestic meter):
                    </i>
                </h3>
                <div className="font-greek text-lg mb-2">
                    <strong>Verse:</strong> Ζεὺς μὲν ἀ-φίκ-τωρ ἐ-πί-δοι προ-φρό-νως
                </div>
                <div className="font-mono text-classical-blue-700 mb-2">
                    <strong>Metrics:</strong> - UU- - UU- UU-
                    <br/>
                    <strong>Thesis/Arsis pattern (optional):</strong>{" "}
                    A-T-T-A-A-T-T-A-T-T-A
                </div>
                <div className="text-sm text-gray-600">
                    <strong>Tips:</strong>
                    <br/>
                    <li>
                        For the metrical feet, use U for a short syllable, - for a long
                        syllable, and X for an anceps. Separate feet with spaces. Other
                        popular metrical symbols (such as ◡, –, etc.) are automatically
                        transliterated; however, please prefer this standard, to avoid
                        issues.
                    </li>
                    <li>
                        The total number of the metrical marks (U, -, X) and of the
                        Arsis/Thesis marks (if defined) should be equal to the number of the
                        syllables in the verse.
                    </li>
                </div>
            </div>
        </div>
    );
}
