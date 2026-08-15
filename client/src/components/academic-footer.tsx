import {useState}                                            from "react";
import {Button}                                              from "@/components/ui/button";
import {Card, CardContent}                                   from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {BookOpen, ChevronDown}                               from "lucide-react";

/** Displays academic sources, references, and attribution. */
export default function AcademicFooter() {
    const [isOpen, setIsOpen] = useState(false);
    
    const primarySources = [
        {
            author: "Aristoxenus of Tarentum",
            work:   "Elementa Rhythmica",
            date:   "4th c. BCE",
            description:
                    "Core treatise on rhythmics and musical perception; introduced chronos units, rhythm ratios, and distinction between melody and meter.",
        },
        {
            author: "Alypius of Alexandria",
            work:   "Eisagōgē Mousikē (“Introduction to Music”)",
            date:   "4th c. CE",
            description:
                    "Technical manual on ancient notation, giving per-mode, per-genus tables mapping scale degrees to notation symbols; background confirming the notation system's rigor, not itself the source of this project's implemented interval values.",
        },
        {
            author: "Delphic Hymns",
            work:   "First and Second (fragmentary) Delphic Hymn to Apollo",
            date:   "2nd century BCE",
            description:
                    "Rare surviving examples of notated Greek music whose text and notation permit unusually detailed analysis of melodic contour and metrical rhythm.",
        },
        {
            author: "Seneca the Younger",
            work:   "Epistulae Morales ad Lucilium",
            date:   "1st c. CE",
            description:
                    "Cited for a reference to the scabellum (foot-clapper used to cue tempo, chiefly for pantomime dancers) in theatrical/musical performance.",
        },
        {
            author: "Lucian of Samosata",
            work:   "On Dancing (Peri Orchēseōs)",
            date:   "2nd c. CE",
            description:
                    "Dialogue defending pantomime performance; distinguishes tragic (emmeleia), comic (kordax), and satyric (sikinnis) dance as the three genres (§26), and treats the pantomime dancer's need for adaptable, all-encompassing mimicry (§67).",
        },
        {
            author: "Apuleius",
            work:   "Metamorphoses, Book XI",
            date:   "2nd c. CE",
            description:
                    "Description of the tympanon (frame drum, called a \"timbrel\" in translation) carried in procession by the high priest during the Isis initiation narrative.",
        },
        {
            author: "Vitruvius",
            work:   "De Architectura (Book V.iii-v and Book X.viii)",
            date:   "1st c. BCE",
            description:
                    "Book V.iii-v: theater acoustics and resonance vessels (echeia) tuned to the diatonic, chromatic, and enharmonic genera. Book X.viii: the hydraulis (water organ) mechanism, described in full technical detail.",
        },
        {
            author: "Ptolemy (Claudius Ptolemaeus)",
            work:   "Harmonics",
            date:   "2nd c. CE",
            description:
                    "Harmonics II.10–11 (Jon Solomon trans., pp.88–92) supports the optional seven-tonos transposition layer; I.13 and II.13–14 support the separately documented Archytas enharmonic material.",
        },
        {
            author: "Aristides Quintilianus",
            work:   "On Music (De Musica)",
            date:   "3rd-4th c. CE",
            description:
                    "Comprehensive treatise on music theory, including modal ethos and rhythmic patterns.",
        },
        {
            author: "Pseudo-Plutarch",
            work:   "De Musica (Peri Mousikēs) — distinct work from Aristides Quintilianus's treatise of the same title above",
            date:   "c. 1st-5th c. CE (authorship and date disputed: candidates include Dionysius of Halicarnassus, or Plutarch of Athens)",
            description:
                    "Dialogue on the history and ethics of Greek music; extensive qualitative characterization of modal ethos (Dorian as grave/solemn, Lydian as suited to lament, Mixolydian as fitting for tragedy).",
        },
        {
            author: "Aristotle",
            work:   "Politics, Book VIII (1342a31-33, 1341a18-20)",
            date:   "4th c. BCE",
            description:
                    "Critiques Plato's Republic for retaining the Phrygian mode while rejecting the aulos, and rejects professional-skill instruments (aulos, kithara) from education.",
        },
        {
            author: "Plato",
            work:   "Republic, Book III (398e-399a)",
            date:   "4th c. BCE",
            description:
                    "Rejects Mixolydian and syntonolydian harmoniai as dirge-like; retains only Dorian and Phrygian for the guardians' education.",
        },
    ];
    
    const modernScholars = [
        {
            author: "Marcus Mota",
            works:  [
                "Meter and Representation: Creating Audio Files and Midi from Greek Tragedy Texts (University of Brasilia)",
            ],
            description:
                    "Primary methodology for three-layer MIDI approach: a vocal-guide audio track, a percussive duration track, and a separate percussive accent track.",
        },
        {
            author: "Martin L. West",
            works:  ["Ancient Greek Music (Oxford, 1992)"],
            description:
                    "Definitive modern scholarship on instruments, rhythm, pitch, and metrical patterns; pp.148–150 support the application's Sapphic/Alcaic 6/8–6/8–10/8 line-timing model.",
        },
        {
            author: "Stefan Hagel",
            works:  ["Ancient Greek Music: A New Technical History (Cambridge, 2009)"],
            description:
                    "Crucial for understanding pitch, notation, modes, and performance mechanics from extant documents.",
        },
        {
            author: "Christopher C. Marchetti",
            works:  ["Aristoxenus, Elements of Rhythm (PhD dissertation, Rutgers University)"],
            description:
                    "Critical edition consulted for Aristoxenus's genus ratios and the irrational khoreios (Elementa Rhythmica II §20, §30).",
        },
        {
            author: "Jon Solomon (trans.)",
            works:  ["Ptolemy Harmonics: Translation and Commentary"],
            description:
                    "Translation and commentary consulted for Archytas's enharmonic genus ratios (Harmonics I.13), Ptolemy's critique of Archytas (I.14), and the Book II tables comparing Archytas, Aristoxenus, Eratosthenes, Didymus, and Ptolemy's own tetrachord divisions (I.12-13, II.13-14).",
        },
        {
            author: "Armand D'Angour",
            works:  ["\"Rediscovering Ancient Greek Music\" (OUP blog)"],
            description:
                    "General-audience overview of Greek music reconstruction methods.",
        },
        {
            author: "Andrew Barker",
            works:  ["Greek Musical Writings (2 vols., Cambridge, 1984–1989)"],
            description:
                    "Translations and commentaries on all ancient Greek theorists, including Plato, Aristoxenus, Ptolemy.",
        },
        {
            author: "Egert Pöhlmann & Martin L. West",
            works:  [
                "Documents of Ancient Greek Music: The Extant Melodies and Fragments (Oxford, 2001)",
            ],
            description:
                    "Edition and commentary on all surviving pieces of notated Greek music.",
        },
        {
            author: "Egert Pöhlmann",
            works:  [
                "\"Vitruvius De Architectura V: Resounding Vessels in the Greek and Roman Theatre\" (Greek and Roman Musical Studies 9, 2021)",
            ],
            description:
                    "Theatre acoustics and resonance vessels (ēcheia) in Vitruvius, following Aristoxenus.",
        },
        {
            author: "Tosca A.C. Lynch",
            works:  [
                "ARSIS AND THESIS IN ANCIENT RHYTHMICS AND METRICS: A NEW APPROACH (The Classical Quarterly, 2016)",
                "\"Rhythmics\" in A Companion to Ancient Greek and Roman Music (Wiley-Blackwell, 2020)",
            ],
            description:
                    "Analysis of ancient Greek rhythmic theory and the arsis-thesis relationship in Greek metrical systems; the 2020 chapter independently confirms this project's core Aristoxenian genus ratios.",
        },
        {
            author: "Maria Gerolemou",
            works:  [
                "\"Some Thoughts on the Mechanical Features of Pantomime Dancers\" (Araucaria, Universidad de Sevilla)",
            ],
            description:
                    "Confirms Libanius, Oration 64, as a primary source on pantomime dance mechanics.",
        },
        {
            author:      "Paola D'Alessio",
            works:       [
                "\"Aspetti della tradizione manoscritta di Coricio di Gaza\" (Kentron, 2016)",
            ],
            description: "Manuscript-tradition study of Choricius of Gaza.",
        },
        {
            author: "Chrḗstos Terzḗs",
            works:  [
                "\"The Bacchius Fragment: A Critical Edition\" (Greek and Roman Musical Studies 11, 2023)",
            ],
            description:
                    "Critical edition and manuscript study of the Bacchius fragment.",
        },
        {
            author:      "Robert J. Penella (ed.)",
            works:       ["Rhetorical Exercises from Late Antiquity"],
            description: "Translation and edition of Choricius's declamations.",
        },
        {
            author:      "Marie-Hélène Garelli",
            works:       [
                "\"La Danse de Lucien: défense d'une cause ou trait d'esprit?\"",
            ],
            description: "Literary analysis of Lucian's On the Dance.",
        },
        {
            author: "Charles H. Cosgrove",
            works:  [
                "An Ancient Christian Hymn with Musical Notation: Papyrus Oxyrhynchus 1786, Text and Commentary (Mohr Siebeck, 2011)",
            ],
            description:
                    "Study of the earliest known Christian hymn with surviving musical notation.",
        },
        {
            author:      "Jennifer Porter",
            works:       ["Roman Mime and the Public Purse (UBC MA thesis, 2025)"],
            description: "Study of the economics and patronage of Roman mime.",
        },
        {
            author: "Christian Meyer (ed.)",
            works:  [
                "Collectae glossae in De nuptiis Philologiae et Mercurii Martiani Capellae (Liber IX) (HAL, 2013)",
            ],
            description:
                    "Edition of the Carolingian-era glosses on Martianus Capella's Book IX, including glosses corroborating the genus-ratio terminology and a 15-tonoi transposition diagram.",
        },
        {
            author: "Henri Weil and Théodore Reinach (eds./trans.)",
            works:  [
                "Plutarque: De la Musique (Paris, 1900)",
            ],
            description:
                    "Critical edition of Pseudo-Plutarch's De Musica with Greek text, French translation, and extensive explanatory notes.",
        },
        {
            author:      "G. Mystrioti",
            works:       [
                "\"Pseudo-Plutarch's De Musica: The Moral and Pedagogical Importance of Music and Neoplatonism's Critical Attitude Against Its Progress\" (University of Athens)",
            ],
            description: "Study of De Musica's authorship, sources, and its place in the ancient debate on music and ethics; source for the Aristotle and Plato excerpts above.",
        },
    ];
    
    modernScholars.push(
        {
            author: "Thomas J. Mathiesen",
            works:  ["Apollo's Lyre: Greek Music and Music Theory in Antiquity and the Middle Ages (1999)"],
            description:
                    "Supports general ancient precedents for dramatic antiphonal exchange and melismatic practice; it does not reconstruct Antiochene playback patterns.",
        },
        {
            author: "Edith Hall and Rosie Wyles (eds.)",
            works:  ["New Directions in Ancient Pantomime (Oxford, 2008)"],
            description:
                    "Supports the Antiochene pantomime context of gesture, chorus, accompaniment, and rhythmic pulse, while leaving MIDI mapping interpretative.",
        },
    );
    
    const visiblePrimarySources = primarySources.filter(source =>
                                                            source.author !== "Seneca the Younger" && source.author !== "Lucian of Samosata",
    );
    const additionalReferences = [
        "Claude Calame - Choruses of Young Women in Ancient Greece (ritual and musical function).",
        "Peter Parsons (ed.) - The Oxyrhynchus Papyri (papyrological sources for musical notation).",
        "Plato - Republic, Laws (modal ethos and psychological impact of music).",
        "Aristotle - Politics (ethos theory and educational function of music).",
        "M. L. West - Introduction to Greek Metre (Oxford: Clarendon Press, 1987), pp. 33-35 - structural support for the fixed-syllable Aeolic basis and Sapphic/Alcaic aaA stanza structure; it does not support the project's speculative duration array.",
    ];
    
    const antiocheneReferences = [
        {
            author: "Choricius of Gaza",
            work:   "Declamations, Apologia Mimorum",
            date:   "5th c. AD",
            description:
                    "Descriptions of scenic effects, rhythm in performance, and antiphonal musical structures in Late Antique theater.",
        },
        {
            author: "Libanius",
            work:   "Oration 64 (on pantomime)",
            date:   "4th c. AD",
            description:
                    "References to musical pantomime (μουσική παντόμιμος) and theatrical music in Antioch.",
        },
        {
            author: "Bacchius Geron",
            work:   "Introductio Artis Musicae (Eisagōgē Technēs Mousikēs)",
            date:   "4th c. CE",
            description:
                    "Late antique musical treatise on modes, rhythm, and performance practice; defines modulation of character (metabolē kata ēthos) in qualitative terms.",
        },
        {
            author: "Gaudentius",
            work:   "Harmonic Introduction (Eisagōgē Harmonikē)",
            date:   "3rd-4th c. CE (disputed)",
            description:
                    "Treatise on sounds, intervals, systems, tones, and modulation (metabolē), including modulation of character (ēthos); confirms ethos denoted moral/psychological character throughout the tradition.",
        },
        {
            author: "Martianus Capella",
            work:   "De Nuptiis Philologiae et Mercurii (The Marriage of Philology and Mercury) (Book 9.974)",
            date:   "5th c. CE",
            description:
                    "Late antique encyclopedia; Book 9 on music includes the arsis/thesis definition (\"arsis est elatio, thesis depositio uocis ac remissio\") underlying this project's thesis/arsis pitch model.",
        },
        {
            author: "Peter Jeffery",
            work:   "The Lost Chant of Early Christian Antioch",
            date:   "Modern",
            description:
                    "Traces continuity from ancient modal systems to Octoechos, highlighting Antiochene influence.",
        },
    ];
    
    const visibleAntiocheneReferences = antiocheneReferences
    .filter(source => source.author !== "Peter Jeffery")
    .map(source => {
        if (source.author === "Choricius of Gaza") {
            return {
                ...source,
                description:
                    "Relevant Late Antique performance context; it does not supply a recoverable score, response algorithm, or numeric timing rule.",
            };
        }
        if (source.author === "Libanius") {
            return {
                ...source,
                description:
                    "Key Antiochene pantomime context; modern scholarship supports gesture, accompaniment, chorus, and pulse, not a MIDI reconstruction.",
            };
        }
        return source;
    });
    
    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2"/>
                            Academic sources & references
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                    </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4 space-y-6">
                    {/* Primary ancient sources */}
                    <Card>
                        <CardContent className="pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <BookOpen className="h-4 w-4 mr-2"/>
                                Primary ancient sources
                            </h4>
                            <div className="space-y-3">
                                {visiblePrimarySources.map((source, index) => (
                                    <div key={index} className="border-l-2 border-blue-200 pl-3">
                                        <div className="font-medium text-gray-900">
                                            {source.author} - <em>{source.work}</em> ({source.date})
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {source.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Modern scholarship */}
                    <Card>
                        <CardContent className="pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                                Modern scholarship
                            </h4>
                            <div className="space-y-3">
                                {modernScholars.map((scholar, index) => (
                                    <div key={index} className="border-l-2 border-green-200 pl-3">
                                        <div className="font-medium text-gray-900">
                                            {scholar.author}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {scholar.works.map((work, i) => (
                                                <div key={i}>
                                                    <em>{work}</em>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {scholar.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Late Antique Sources */}
                    <Card>
                        <CardContent className="pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="mr-2">🎭</span>
                                Late Antique & Antiochene sources
                            </h4>
                            <div className="space-y-3">
                                {visibleAntiocheneReferences.map((source, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-purple-200 pl-3"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {source.author} - <em>{source.work}</em> ({source.date})
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {source.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Additional references */}
                    <Card>
                        <CardContent className="pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                                Additional references
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {additionalReferences.map((ref, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-gray-400 mr-2">•</span>
                                        {ref}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    
                    {/* Attribution */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                        <p className="mt-2">
                            <strong>Software attribution:</strong>
                            <br/>
                            Ancient Greek Verse to
                            Music Composer - For questions about methodology or
                            implementation, please consult the referenced academic sources
                            above.
                            <br/>
                            Please also read <a
                            href="https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer/blob/master/AI_DISCLOSURE.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >AI_DISCLOSURE.md</a>, for AI assistance and authorship disclosure, and <a
                            href="https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer/blob/master/PROVENANCE.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >PROVENANCE.md</a> (feature-level provenance and implementation register).
                        </p>
                        <p className="mt-2">
                            <strong>Disclaimer:</strong>
                            <br/>
                            Experimental features represent
                            scholarly interpretations of fragmentary ancient sources. Modern
                            interpretation is required where primary evidence is incomplete.
                        </p>
                        <p className="mt-2">
                            <strong>Source code available at:</strong>
                            <br/>
                            <a
                                href="https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer</a>.
                        </p>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
