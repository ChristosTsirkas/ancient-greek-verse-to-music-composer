// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedLocalSymbols

import {useState}        from "react";
import MetricalReference from "@/components/metrical-reference";
import VerseInputForm    from "@/components/verse-input-form";
import SettingsPanel     from "@/components/settings-panel";
import StatusPanel       from "@/components/status-panel";
import AcademicFooter    from "@/components/academic-footer";
import UsageIndicator    from "@/components/usage-indicator";
import UsageLimitsFooter from "@/components/usage-limits-footer";

/** Renders the main verse-to-MIDI workspace. */
export default function Home() {
    const [verses, setVerses] = useState([
                                             {
                                                 text:               "",
                                                 metrics:            "",
                                                 arsisThesisPattern: undefined as string | undefined,
                                             },
                                         ]);
    const [settings, setSettings] = useState({
                                                 instrument:         "aulos" as const,
                                                 tempo:              90,
                                                 mode:               "dorian" as const,
                                                 includeMetronome:   false,
                                                 includeAccentTrack: false,
                                                 includeVocalGuide:  false,
                                                 outputFormat:       "midi" as const,
                                                 allowMelody:        false,
                                                 experimental:       {
                                                     rhythmModel:        "chronos_ratios" as const,
                                                     tonos:              "dorian" as const,
                                                     genus:              "diatonic" as "diatonic" | "chromatic" | "enharmonic",
                                                     baseUnit:           280,
                                                     tuningSystem:       "pythagorean" as const,
                                                     ethosMapping:       false,
                                                     antiocheneFeatures: {
                                                         rhythmicCells:           "standard" as const,
                                                         melismaticOrnamentation: false,
                                                         antiphonalResponse:      false,
                                                         pantomimeLayer:          false,
                                                     },
                                                 },
                                             });
    const [_downloadState, setDownloadState] = useState<any>(null);
    
    /** Adds a new empty verse to the composition. */
    const addVerse = () => {
        setVerses([
                      ...verses,
                      {
                          text:               "",
                          metrics:            "",
                          arsisThesisPattern: undefined,
                      },
                  ]);
    };
    
    /** Removes a verse by its position in the composition. */
    const removeVerse = (index: number) => {
        if (verses.length > 1) {
            setVerses(verses.filter((_, i) => i !== index));
        }
    };
    
    const updateVerse = (
        index: number,
        field: "text" | "metrics" | "arsisThesisPattern",
        value: string | undefined,
    ) => {
        const newVerses = [...verses];
        if (field === "arsisThesisPattern") {
            newVerses[index].arsisThesisPattern = value;
        } else if (field === "text") {
            newVerses[index].text = value || "";
        } else if (field === "metrics") {
            newVerses[index].metrics = value || "";
        }
        setVerses(newVerses);
    };
    
    return (
        <div className="bg-marble-50 text-gray-800 min-h-screen">
            {/* Header */}
            <header className="bg-classical-blue-800 text-white shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-start">
                        <div className="text-center flex-1">
                            <h1 className="text-4xl lg:text-5xl font-classical font-bold mb-4">
                                <i className="fas fa-columns text-greek-gold-400 mr-4"></i>
                                Ancient Greek Verse to Music Composer
                            </h1>
                            <p className="text-classical-blue-100 text-lg max-w-3xl mx-auto">
                                Transform Ancient Greek verses into musical representations.
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <UsageIndicator/>
                </div>
                
                <MetricalReference/>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Form */}
                    <div className="lg:col-span-2">
                        <VerseInputForm
                            verses={verses}
                            onAddVerse={addVerse}
                            onRemoveVerse={removeVerse}
                            onUpdateVerse={updateVerse}
                            onGenusChange={(genus) =>
                                setSettings((prev) => (
                                    {
                                        ...prev,
                                        experimental: {
                                            ...prev.experimental,
                                            genus,
                                        },
                                    }
                                ))
                            }
                            onUpdateExperimental={(updates) =>
                                setSettings((prev) => (
                                    {
                                        ...prev,
                                        experimental: {
                                            ...prev.experimental,
                                            ...updates,
                                        },
                                    }
                                ))
                            }
                            settings={settings}
                        />
                    </div>
                    
                    {/* Settings Panel */}
                    <div className="space-y-6">
                        <SettingsPanel
                            settings={settings as any}
                            verses={verses}
                            onUpdateSettings={setSettings as any}
                        />
                        <StatusPanel
                            verses={verses}
                            settings={settings}
                            onSettingsChange={() => setDownloadState(null)}
                        />
                    </div>
                </div>
                
                {/* Usage Limits Section */}
                <div className="mt-12 mb-8">
                    <UsageLimitsFooter/>
                </div>
                
                {/* Copyright Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                            Ancient Greek Verse to Music Composer - Academic research tool
                        </p>
                        <p className="text-xs text-gray-500">
                            Copyright ©{" "}
                            <a
                                href="https://independent.academia.edu/ChrisTsirkas"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Chris Tsirkas
                            </a>
                        </p>
                    </div>
                </div>
                
                {/* Academic Footer */}
                <AcademicFooter/>
            </div>
        </div>
    );
}
