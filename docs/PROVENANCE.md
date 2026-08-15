# Provenance

Binds every sourced claim in this project to its citation, source text,
and implementation. Single source of truth. Open work: `TODO.md`.

**Source cross-references.** Where a source required a claim-by-claim
implementation audit, that audit is retained as an appendix to this
file. This keeps the citation, implementation status, and any remaining
limit together in the project’s single provenance record.

**Rules for entries below:**
- Ancient / public-domain sources: original-language text quoted as-is,
  plus a plain gloss.
- Modern / copyrighted sources: bibliographic reference and summary only.
- Every entry states what code implements it.
- **Independent corroboration policy.** Any source that independently
  verifies or corroborates an already-implemented claim sourced to
  another (older) author must be added here, under that claim's entry —
  never left out because the claim is "already sourced."
- **Aside-note policy.** Primary source material that is relevant but
  not directly implemented or cited still gets recorded here as an
  aside note for the reader's consideration, rather than omitted for
  being adjacent-but-unused.
- **Corroboration-vs-agreement distinction.** A source that affirms the
  same *general, settled* fact a narrower claim rests on (e.g. "Greek
  accent is pitch-based, not dynamic") does not corroborate that
  narrower claim (e.g. a specific author's argument about how
  *rhythmical* arsis/thesis is marked) unless it addresses the same
  specific point. Log the broader agreement as an aside note under the
  narrower claim's entry, explicitly labeled as agreement-on-the-
  general-point rather than corroboration, so the distinction survives
  for future readers and isn't later mistaken for independent
  verification.

---

## Implemented and Verified

### Rhythm: Aristoxenian genus ratios

**Claim:** dactylic genus in the equal ratio (1:1), iambic in the double
ratio (2:1), paeonic in the hemiolic ratio (3:2).

**Primary source.** Aristoxenus of Tarentum, *Elementa
Rhythmica* II.30:

> γένη ἐστί· τό τε δακτυλικὸν καὶ τὸ ἰαμβικὸν καὶ τὸ παιωνικόν.
> δακτυλικὸν μὲν οὖν ἐστι τὸ ἐν τῷ ἴσῳ λόγῳ, ἰαμβικὸν δὲ τὸ ἐν τῷ
> διπλασίῳ, παιωνικὸν δὲ τὸ ἐν τῷ ἡμιολίῳ.

*Gloss:* three genera admit continuous rhythmic composition — dactylic
(equal ratio, 1:1), iambic (double ratio, 2:1), paeonic (hemiolic
ratio, 3:2).

**Critical edition.** Marchetti, Christopher C. *Aristoxenus, Elements
of Rhythm.* PhD dissertation, Rutgers University. §30, p.74.

**Independent corroboration (modern books, reference only).**
- Lynch, Tosca A. C. "Rhythmics." In *A Companion to Ancient Greek and
  Roman Music*, ch. 20. Wiley-Blackwell, 2020. Same three ratios, same
  section reference.
- West, M. L. *Ancient Greek Music*. Oxford, 1992, p.140. Paeonic genus
  given as 2:3 (same ratio, inverse order).
- Christian Meyer (ed.), *Collectae glossae in De nuptiis Philologiae et
  Mercurii Martiani Capellae (Liber IX)*, Cambridge, Corpus Christi
  College Library, Ms. 153 et 330 (HAL, 2013). Glosses 208–210 on
  Martianus Capella's own genus terms: *AEQUALIA* → *dactilica*,
  *EMIOLIA* → *peonica*, *DUPLICIA* → *iambica* — same three genera,
  same ratio names (equal/dactylic, hemiolic/paeonic, double/iambic),
  independent 9th/10th-c. Carolingian transmission.

Aristoxenus explicitly rejects a fourth ratio, the "epitritic" (4:3), as
unsuitable for continuous rhythm composition (*Elementa* §30, §20) — a
real ancient concept, not a valid genus ratio, and not tied to any
specific foot such as iamb or trochee.

**Aside note — active pointer, corrected against a better source.** This
project's epitritic-rejection claim above is Aristoxenus' own position
and stays correct as a statement about *him*. It is not the last
ancient word on the ratio — but the fuller picture, available via
Lynch's 2020 chapter ("Rhythmics," n.29, drawing directly on primary
sources), is more precise than what this note previously said, and
corrects it:

- It is **not** Aristides Quintilianus who "adds the epitrite as a
  fourth genus" — Lynch states explicitly that "Aristides does not
  include the epitritic ratio in his discussion of different
  rhythmical genera but examines epitritic feet in his section on
  meter, describing them as various combinations of one short and
  three long syllables" (i.e. metrically, not as a rhythmic genus).
- The claim that "some people accepted the epitritic ratio too"
  belongs to **Psellus** (*Prolamb.* §9) and **Porphyry** (*Harm.*
  37.28 Düring) — unnamed "some people," not Aristides.
- Aristides Quintilianus' role is narrower: he notes the epitritic
  ratio was used only "sparingly" (34.14–15) and appears in
  iambo-trochaic verse coupled with standard iambs/trochees, not as an
  independent rhythmical genus.
- Same passage (*Elementa* §20) also covers the "irrational chorees"
  — feet Aristoxenus acknowledges occur in practice despite rejecting
  the epitritic ratio as a genus for *continuous* rhythm production.
  Directly relevant to this project's separate "irrational khoreios"
  entry below.

Net effect: the earlier framing (Aristoxenus vs. Aristides, two
authorities in direct disagreement) overstated the case. The more
accurate picture is Aristoxenus' clear rejection for continuous
composition, against scattered, occasional, non-genus use attested by
later authors (Psellus, Porphyry) and acknowledged in passing by
Aristides — not a settled four-genus alternative. Still doesn't license
implementing a 4:3 genus; if anything, this makes that even less
supported than the previous note implied.

**Decision: not implementing** the *rhythmical*
epitritic genus (4:3 as a ratio-based genus alongside dactylic/iambic/
paeonic). No such genus will be added to `getFootPatterns()`. This
aside note stays as the active pointer described above — re-open only
if a future source specifically asserts the epitrite as a settled,
independent *rhythmical* genus (not scattered/occasional use, which is
already the documented ancient picture and doesn't change this
decision).

**Important — do not confuse this decision with the entry immediately
below.** `footRatios` already contains `epitrite_1`–`epitrite_4`, which
implement the *metrical* epitrite (a different ancient concept, real
and correctly present) — see next entry. The "not implementing"
decision above is specifically about the *rhythmical* genus, and does
not apply to those.

**Implementation:** the live exact-shape table is `metricalPatterns`
in `server/services/metrical-analysis.ts`; it supplies the long/short
durations consumed by MIDI generation. In the live `chronos_ratios`
branch, `calculateNoteLength()` reads that `durationTablature` as short
= 1 and long = 2. `getFootPatterns()` and
`computeFootStructure()` in `midi-generator.ts` are unused helpers,
not the runtime implementation. Aristoxenus, *Elementa Rhythmica*
§§10, 16–20 (Marchetti trans., pp.68–71) defines a foot through
arsis/thesis markers measured as multiples of one primary time. The
live path preserves its selected long/short duration at a foot boundary
without adding a boundary-duration unit.

---

**Live location.** All the following are matched by scansion string
in `metricalPatterns` (`server/services/metrical-analysis.ts`), which
feeds `verse.metricPatterns` — the actual data `createRhythmTrack`
consumes. `computeFootStructure()` and its `footRatios`/
`matchFootAtIndex()` helpers in `midi-generator.ts` are not called from
the live generation path. Citations below point to the live file.

**How to actually trigger these — exact match only, no UI hint
anywhere.** The metrics field parser (`processVerses`,
`server/services/metrical-analysis.ts`) splits input on whitespace only
and looks up each space-separated group as a literal key — no partial
matching, no combining adjacent groups. A group that doesn't match a
key exactly falls back to individual long/short atoms, losing any
compound-foot identity entirely. To reach a pattern below, it must
appear as its own space-separated block in the metrics field:

| Pattern                              | Exact string(s) required          |
|--------------------------------------|-----------------------------------|
| First/Second/Third/Fourth Epitrite   | `U---` / `-U--` / `--U-` / `---U` |
| Ionic a minore / a maiore            | `UU--` / `--UU`                   |
| Rhythmical Bacchius 1 (iamb+trochee) | `U--U`                            |
| Rhythmical Bacchius 2 (trochee+iamb) | `-UU-`                            |

This is a power-user-input tool, not an end-user one, so exact-string
input is a reasonable design — but nothing in the UI currently
surfaces which strings map to which named foot. Worth knowing before
assuming a test verse "should" exercise one of these; ordinary
dactylic/iambic verse never will.

### Rhythm: metrical epitrites

**Claim:** four rotational positions of one short + three long
syllables, the metrical (not rhythmical-genus) epitrite.

**Source.** Lynch, Tosca A. C. "Rhythmics" (2020), n.29, citing
Aristides Quintilianus, *De Musica* 45.5–11: "Aristides does not
include the epitritic ratio in his discussion of different rhythmical
genera but examines epitritic feet in his section on meter, describing
them as various combinations of one short and three long syllables."
This is a distinct ancient concept from the *rhythmical* epitritic
ratio (4:3 as a genus) that Aristoxenus rejects — see the aside note
above. Both are real; they are not in tension with each other.

**Implementation:** `"U---"`/`"-U--"`/`"--U-"`/`"---U"` — already
present and correctly named ("First"–"Fourth Epitrite") in
`metricalPatterns`, `server/services/metrical-analysis.ts`. Live.

---

### Rhythm: ionics

**Claim:** ionic a minore = short-short-long-long (proceleusmatic +
spondee); ionic a maiore = long-long-short-short (spondee +
proceleusmatic).

**Source.** Lynch, Tosca A. C. "Rhythmics" (2020): "Ionic a maiore
(4)+(2), spondee+proceleusmatic" and "Ionic a minore (2)+(4),
proceleusmatic+spondee."

**Implementation:** `"UU--"`/`"--UU"` — already present and correctly
named ("Ionic a minore/maiore") in `metricalPatterns`,
`server/services/metrical-analysis.ts`. Live.

---

### Rhythm: rhythmical bacchius

**Claim:** a compound rhythmical foot conjoining a full iamb (1:2) and
a full trochee (2:1) as two separate arsis/thesis pairs (six units
total) — a different ancient concept from the metrical bacchius family
(fixed 3-syllable feet: short-long-long / long-long-short / long-
short-long, real and separate).

**Source.** Lynch, Tosca A. C. "Rhythmics" (2020): "Bacchius 1
(1:2)+(2:1), iamb+trochee" and "Bacchius 2 (2:1)+(1:2), trochee+iamb."

**Implementation.** Both the metrical family and Lynch's rhythmical
compounds turn out to share shapes with entries already present and
live in `metricalPatterns` (`server/services/metrical-analysis.ts`),
under standard classical-metrics names rather than Lynch's —
cross-referenced there:
- Metrical bacchius (short-long-long) = `"U--"` ("Antidactyl")
- Metrical antibacchius (long-long-short) = `"--U"` ("Anti-anapaest")
- Metrical palimbacchius (long-short-long) = `"-U-"` ("Cretic")
- Lynch's rhythmical Bacchius 1 (iamb+trochee) = `"U--U"` ("Antispast")
- Lynch's rhythmical Bacchius 2 (trochee+iamb) = `"-UU-"` ("Choriamb")

All five are live; none needed new code, only the cross-reference. Here,
“live” means that an exact user-entered foot string is accepted by the current
parsing and primary duration route. The shared quantity shapes do not carry
separate semantic metadata at runtime: `"U--U"` is not audibly distinguished
as a Lynch compound rather than an antispast, nor is `"-UU-"` distinguished
as a Lynch compound rather than a choriamb.

---

### Rhythm: "larger"/"greater" feet — structurally out of scope, not a bug

**Claim.** Aristides Quintilianus describes 4x-magnitude versions of
basic feet, same ratio, slower absolute duration: Orthios (arsis 4,
thesis 8, still 1:2 like basic iamb), *trochaios sēmantos* ("marked
trochee," thesis 8, arsis 4, still 2:1), a "greater spondee" (4:4, vs.
basic spondee's 2:2), and *paiōn epibatos* (a more complex paeonic-
genus division, source passage flagged as possibly corrupted by
Lynch — 4:6, an alternative 6:4 reading rejected as "unlikely").

**Source.** Lynch, Tosca A. C. "Rhythmics" (2020), citing Aristides
Quintilianus, *De Musica* 36.3–5 (Orthios/*sēmantos*), 35.11–13
(greater spondee), and 37.10–12 (*paiōn epibatos*).

**Why these can't be implemented as separate entries, in either
matching system checked.** Both live and dead pattern tables in this
project match by relative shape only (a sequence of short/long
syllable-duration ratios) — neither tracks absolute tempo/magnitude.
The current shape-only representation cannot encode the absolute magnitude
of these feet, as they differ in absolute magnitude/duration rather than
relative shape (Orthios = iamb's `"U-"` shape, *sēmantos* = trochee's
`"-U"`, greater spondee = spondee's `"--"` performing at 4x absolute
duration). A shape-only matcher structurally cannot distinguish them from
their base feet; giving them separate entries with the same shape would
just make one entry unreachable behind the other. Representing them for
real would need the pipeline to track absolute tempo/magnitude
separately from foot shape — a different feature, not a missing table
entry. Not tracked as an open `TODO.md` item for that reason; this is
the final word on it barring a future decision to build tempo-tracking
as its own feature.

**Formal closure.** The claim-by-claim audit is retained in
“Appendix: Lynch cross-reference and implementation audit” below. Its
live-path check confirms that the selected, shape-representable claims
are implemented; larger/greater feet remain structurally out of scope,
and strict per-foot normalization remains the separately documented
`TODO.md` item 1b. Verified via the live call chain:
`POST /api/generate-midi` (`server/routes.ts`) →
`metricalAnalysis.processVerses()` → `metricalPatterns`
(`server/services/metrical-analysis.ts`, where every other entry above
lives) → `midiGenerator.generate()` → `createTracks()` →
`createRhythmTrack()` (arsis/thesis pitch contrast). Traced end to end
through the actual route, not asserted from reading functions in
isolation.

---

### Rhythm: irrational khoreios (anceps value)

**Claim:** the anceps duration 1.5 (long=2/short=1 scale) is
Aristoxenus' own described construction.

**Primary source, via Lynch's gloss (2020, ch.20; reference only).**
Aristoxenus, *Elementa Rhythmica* §20: comparing a downbeat-2 foot's
upbeat across three cases — equal-ratio (upbeat 2), double-ratio
(upbeat 1), and a third, "irrational" foot whose upbeat is explicitly
described as intermediate between the previous two, i.e. 1.5. This is
the same passage in which Aristoxenus rejects the epitritic ratio above
— the irrational foot is explicitly distinguished from it.

**Implementation:** `isAnceps()` (`midi-generator.ts`, range `[0.5,
1.5]`) and the `X`/compound-X entries in `metrical-analysis.ts`'s
pattern table (1.5 there; 0.75 in metrical-analysis.ts's different base
unit — same ratio). Ancient theory distinguishes the irrationality of a
duration from *anceps* as a metrical position/element. The code uses
1.5 as a duration-valued anceps mapping to Aristoxenus' described
construction.

---

### Rhythm: dochmiac (Lynch/West convergence)

**Claim:** the live `metricalPatterns` table
(`server/services/metrical-analysis.ts`) includes a dochmiac shape
reflecting Lynch's rhythmical analysis of an actual notated ancient
score, corroborated independently by West's general paradigm — added
alongside, not replacing, the previously-implemented standard metrical
shape.

**Lynch (2020), via DAGM 3 — the primary rhythmical source.** *DAGM*
(*Documents of Ancient Greek Music*) 3 is an actual notated ancient
score preserving a dochmiac from Euripides' *Orestes*. Lynch's
analysis of it: the attested rhythmical dochmiac is a compound of an
iamb plus a "lame" paean, described as a 3+5 time-unit split, with a
specific arsis/thesis diagram (`↑ ↑ ↓↓`) given for one variant, plus
several further resolved variants noted (e.g. "fully resolved dochmiac
3/8+5/8," "double proceleusmatics 4/8+4/8"). Lynch explicitly calls
the lame paean's exact internal syllable arrangement ambiguous — the
3+5 split and the compound iamb+paean structure are her stated
findings; the lame paean's precise 3-position internal shape is not.

**This project's resolution of that specific ambiguity.** The iamb
component (short-long, the Aristoxenian double ratio 2:1 — see
"Rhythm: Aristoxenian genus ratios" above) sums to exactly 3 short-
note-equivalents (1+2), matching Lynch's "3" cleanly with no
interpretive gap. For the remaining "lame paean" (3 positions summing
to Lynch's "5"), this project selects a cretic shape (long-short-long,
2:1:2 — an ancient rhythmic genus already sourced and implemented
elsewhere in this codebase; see the `antiocheneRhythmicCells` cretic
entries in `midi-generator.ts`, corrected in Item 2 of this batch) as
the most standard, already-attested 3-position shape summing to 5
(2+1+2). This choice is this project's own resolution of an ambiguity
Lynch herself flags, not itself asserted as Lynch's specification —
distinguished explicitly from the iamb component, which is not
ambiguous.

**Combined shape: short-long-long-short-long.**

**Independently, West, *Ancient Greek Music*, p.142 (page images on
hand) gives the same shape as a general paradigm**, reached via a
different route: "the equivalent of eight short notes, divided
unequally in groups of three and five. The paradigm form is [short-
long-long-short-long]." West is describing the dochmiac generally,
not analyzing the same *Orestes* score Lynch works from.

**Open question, not resolved by the material on hand: is this
independent convergence, or does Lynch's own analysis draw on West's
paradigm (or a shared prior source both rely on)?** Both are credible
possibilities — West's *Ancient Greek Music* (1992) predates Lynch's
2020 chapter, so Lynch citing or being influenced by West is entirely
possible, but nothing in the material on hand confirms this either
way, and Lynch's analysis is explicitly grounded in a specific
notated score (DAGM 3) rather than presented as a restatement of
West's general paradigm. Recorded as an open question for the paper,
not asserted as either independent corroboration or derivation.

**Chronological boundary.** DAGM 3 preserves material from the
Hellenistic transmission of a late-fifth-century BCE Athenian tragedy;
it is not Late Antique Antiochene performance evidence. Its dochmiac
analysis supports the separately selectable metrical/rhythmic listening
model. It does not authenticate the application's Antiochene scenic
options, ornamental pitches, response patterns, MIDI timing, or gesture
mapping. Combining a dochmiac-derived option with the Antiochene panel
is therefore an exploratory modern synthesis, not a reconstructed
Syrian performance practice.

**Implementation — additive, not a replacement.** Verse input is
space-separated into discrete feet, and each space-separated foot is
looked up as an *exact dictionary key* against `metricalPatterns`
(`server/services/metrical-analysis.ts`) — there is no scanning or
partial matching, so two differently-keyed dochmiac shapes coexist
with zero collision risk. `metricalPatterns["U--U-"]`
(short-long-long-short-long, duration `[0.5, 1.0, 1.0, 0.5, 1.0]`) was
added as a new entry; `metricalPatterns["U---U"]` (short-long-long-
long-short, duration `[0.5, 1.0, 1.0, 1.0, 0.5]`, the previously-sole
entry) was kept, not superseded. This matches the sources better than
a single fixed shape could: real ancient dochmiacs have multiple
attested surface realizations (Lynch's own "resolved variants" note
above), and a single key can only ever catch one. Nothing that
matched before stops matching — this is purely additive. The `accent`
array on both entries (`[0, 1, 0, 1, 0]`) is unchanged and is **not**
informed by this fix — Lynch's `↑ ↑ ↓↓` arsis/thesis diagram has four
elements, not five, so it doesn't map cleanly onto either five-position
pattern; changing it would require a separate, currently-unavailable
source. `"U---U"` has no source in this project that specifically
establishes that exact surface shape; if one is identified, add its
citation to this entry and the appendix below.

**Consistency note.** `"U--U-"`'s shape matches the `dochmiac`
entry in `antiocheneRhythmicCells` (`midi-generator.ts`), corrected to
the same West paradigm in Item 2 of this batch — though that table's
fields are confirmed dead/unread at runtime (see "Antiochene rhythmic
cells: pattern/duration shapes" above), so the consistency is
documentary, not functional. The former auxiliary dochmiac helpers and
duplicate `footRatios` copies have since been removed. One unused
`footRatios` table remains in `midi-generator.ts`; it is not runtime
evidence for either surface realization.

**Resolution rules, sourced (West, *Ancient Greek Music*, pp.142–143)
— not yet built as generative
logic.** West gives specific, citable rules for how the base
short-long-long-short-long paradigm varies in practice, distinct from
the base shape question resolved above:

- **Long-note splitting.** "Any of the long notes (but most frequently
  the first) could be divided into two short ones, except, of course,
  for the final note of the final bar before a pause." An attested
  extreme: one Euripidean passage has 32 consecutive short notes
  across four bars, each bar-line coinciding with a word-end — a fact
  about that specific passage, not a general "32" rule.
- **First-position irrational-long substitution.** "The first of the
  two short notes in the paradigm form, rather as in the iambic
  rhythm, could be replaced by an 'irrational' long" — two variant
  realizations given (one rarer, one "much more often"), both
  involving a non-integer-ratio duration rather than a plain long.
- **Second-position irrational-long substitution.** "The second short
  note could also be replaced by a long, but normally only if the two
  long notes on either side of it remained undivided." More
  restricted than the first-position case — requires the flanking
  longs to not already be split by the rule above. "It was not until
  Euripides that the second irrational became at all frequent" —
  i.e., a later development, rare before Euripides.
- **Co-occurrence.** "The two irrational longs could occur in the same
  bar" — both substitutions above are independently attested to
  combine.

**One rule implemented: first long splits into two shorts.**
`metricalPatterns["UUU-U-"]` (`server/services/metrical-analysis.ts`)
— the most-attested single rule above, applied to the first long of
`"U--U-"`. Additive, not a replacement: verse input is matched
foot-by-foot against exact dictionary keys, so this coexists safely
with `"U--U-"` and `"U---U"`, same architecture as their own addition
(see above). Per West's own exception, this shape should not represent
a dochmiac that is the final foot before a pause. The `accent` array
is this project's own interpretive choice for how the original split
position's accent value maps onto the two new positions — not itself
sourced, documented as such at the implementation site.

**Remaining rules not yet implemented.** The two irrational-long
substitutions need MIDI-timing support for non-integer-ratio durations
(comparable to the existing pitch-bend-based fractional-cents
mechanism, but for duration rather than pitch) and are a larger step
than the deterministic split above. West doesn't give frequencies or
probabilities for how often each variant occurs relative to the base
paradigm, only relative-frequency language ("most frequently," "much
more often," "normally only") — turning that into further generative
choices remains a design question for anything beyond the single rule
implemented.

**Further resolution rules, West p.144 — the fragmentation patterns beyond the basic long-splitting
and irrational-substitution rules above:**
- **Reverse-order fragmentation ("hypodochmius").** The 3+5 groups
  occasionally appear reversed (5+3) rather than the standard 3+5.
- **Standalone paeon repetition.** The 5-group, considered by itself as
  a paeon, may be repeated a few times on its own without the 3-group —
  attested at *Agamemnon* 1136–7 = 1146–7.
- **3-group prefixed to an iambic unit.** An isolated measure in the
  form of the dochmiac's 3-group, but prefixed to an iambic rather than
  a paeonic unit.
- **Further irregular forms, noted but not fully resolved even by
  West:** an extra short note where the responding strophe has one;
  the second short entirely absent (a rarity, "sometimes stands at a
  pause"). West himself calls it "not always clear what rhythmic
  interpretation is to be put on the metrical data" for these last two.
- **Cross-cultural parallel noted by West:** Bartók's Hungarian folk
  music collection includes a Transylvanian song in "perfect dochmiac
  rhythm" — offered as comparative context, not itself a claim about
  ancient Greek practice.

All specific to *Agamemnon* (1156–9=1167–70; 1136–7=1146–7), not
general rules independent of source passage. Not implemented as code —
same design-decision status as the unimplemented p.142–143 rules
above; this extends what's sourced, not what's built.

---

### Rhythm: Sapphic and Alcaic stanza timing

**Claim supported.** The `sapphic_lyric` rhythm model renders Aeolic
Sapphic/Alcaic material as two 6/8 lines followed by a 10/8 third line:
an `aaA` structure in which the third line is the impaction of two
6/8 bar-types.

**Source.** M. L. West, *Introduction to Greek Metre* (Oxford:
Clarendon Press, 1987), pp.33–35. West describes Lesbian Aeolic verse
as fixed in syllable count, identifies the Sapphic and Alcaic stanzas as
the same `aaA` pattern, and explains the third period as an amplification
of the first two.

**Direct musical support.** M. L. West, *Ancient Greek Music* (Oxford:
Clarendon Press, 1992), pp.148–150, Examples 5.11–5.15: the regular
Sapphic lines are represented as 6/8; the third is 10/8, arising from
the impaction of two preceding 6/8 bar-types. West applies the same
two-matching-lines-plus-longer-third-line principle to the Alcaic
stanza. The former five-value `sapphicPattern` array has been removed.

**Implementation and limit.** The input has no explicit stanza field.
When the user explicitly selects `sapphic_lyric`, `createTracks()`
treats consecutive verses as repeating three-line groups (6/8, 6/8,
10/8). `calculateNoteLength()` preserves each line's supplied long/short
proportions while normalizing the line to West's cited total. The
within-line distribution is an application implementation choice; West
supplies the line totals and impaction analysis, not this software's
generic syllable-allocation algorithm.

**Timing correction.** The normalization uses the generator's shared
500-ms MIDI reference unit. It must not reuse `baseUnit`, which belongs
to the user-adjustable `chronos_ratios` path and previously defaulted to
280 ms even though Sapphic/Alcaic timing exposes no corresponding
control. That accidental reuse compressed every 6/8 and 10/8 line; the
correction changes this model only and is covered by focused timing tests.

---

### Rhythm: Delphic paeonic patterns

**Claim:** the two patterns cycling in `authenticDelphicPatterns`
(`delphic_paean` rhythm model, `midi-generator.ts`) are the two
canonical Classical-period paeonic note-shapes.

**West, *Ancient Greek Music*, pp.140–141.** The paeonic
genus has thesis:arsis in a 2:3 durational ratio — quintuple time.
"In the Archaic and Classical periods this rhythm was normally
expressed in the note-patterns [long + 3 shorts] and [3 shorts +
long], rarely [short + long + short + short]." West's own n.7 cites
Aristid. Quint. 1.15–17 (p.35.3ff), Aristotle *Rh.* 1409a4, and
Aristoxenus *Rhythm.* 2.30 Pearson for the proportional ratios
assigned to each foot type (dactyl 1:1, iambus 1:2, paeon 2:3, etc.).

**Aristides Quintilianus, *De Musica* 1.15–17**
— independently corroborates the same foot-ratio framework West
cites it for.

**Implementation:** `authenticDelphicPatterns = [[2,1,1,1], [1,1,1,2]]`
— pattern 1 is paeon primus (long-short-short-short), pattern 2 is
paeon quartus (short-short-short-long), each summing to 5 units
(quintuple time). West's "rarely" third variant (short-long-short-
short) is not included. `baseUnit`, the ±5% per-note jitter, and the
every-32-notes pause are explicitly speculative application-level
expressive choices. West and the cited ancient sources support the two
paeonic patterns and their quintuple-time structure, not those values.

**West's Ex.5.3, exact figures on p.142 — frequency data, not a duration ratio, still not the basis
for the pattern shapes above.** Four distinct rhythmic patterns,
counted separately for two poets: Athenaeus / Limenius — 22/33,
28/35, 17/24, 13/5. The musical notation glyphs for each of the four
patterns are not mapped to named foot types
(paeon primus/quartus etc.) from the image alone — recorded as
frequency data on hand, not as a claim about which specific shape each
count belongs to.

---

### Dramatic-metre modifier cycles (interpretative; not Antiochene evidence)

**Claim:** the `durations`/`pattern` values on
`antiocheneRhythmicCells`'s `dochmiac`, `fourth_paeon`, `first_paeon`,
`cretic`, and `iamb` entries (`midi-generator.ts`) match their own
names' canonical ancient rhythmic shapes.

**Source for the interpretative cycle concept.** West, *Introduction to
Greek Metre* (1987), pp.55-57, describes documented dramatic combinations
and transitions: cretic-paeonic movement, a tragic strophe that turns from
cretics into dochmiacs, and dochmiacs in conjunction with iambic units.
On pp.66-67 he describes dramatic polymetry, where metre types change
within a strophe. This supports using a foot-based modifier *cycle* as an
interpretative listening design.

**Strict limit.** West does not attest either exact order
(`dochmiac-paeon-cretic` or `paeon-cretic-iamb`), their interchangeability,
their use in Antioch, or any generated pitch/velocity rule. The feature is
therefore not evidence of Antiochene practice.

**Runtime status.** `createRhythmTrack()` checks each selected cell's
`.pattern` against the actual parsed `footPattern.foot`; only a match
receives that cell's application-defined pitch/velocity modifier. Thus,
a cycle follows metrical-foot boundaries and never a raw syllable count.
`.durations`, `.effect`, and `.articulation` remain descriptive metadata.

**Sourced shapes applied regardless, per project dead-code policy (fix
in principle, so the table is already correct if wired into real
output later):**
- `dochmiac`: `[1,2,2,1,2]` — West, *Ancient Greek Music*, p.142:
  "the equivalent of eight short notes, divided unequally in groups
  of three and five. The paradigm form is [short-long-long-short-
  long]." Prior code had this shape encoded correctly in the
  `durations` array but the `pattern` label string read `"UU-U-"`
  (short-short-long-short-long), inconsistent with its own
  `durations`; corrected to `"U--U-"`.
- `fourth_paeon`: `[1,1,1,2]` (short-short-short-long, paeon quartus)
  — prior code's shape was long-short-short-short (paeon primus),
  mismatched to its own `fourth_paeon` name; corrected.
- `first_paeon` (`paeon_cretic_iamb`): `[2,1,1,1]` (long-short-short-
  short, paeon primus) — prior code's shape was short-short-short-
  long (paeon quartus), mismatched to its own `first_paeon` name;
  corrected.
- `cretic` (both arrays): `[2,1,2]` (long-short-long) — standard
  cretic shape; prior values (`[1.4,0.8,1.4]`, `[1.8,0.6,1.6]`) were
  directionally the same shape, tightened to the clean ratio.
- `iamb`: `[1,2]` (short-long) — standard iambic 1:2 ratio; prior
  value `[0.6,1.4]` was directionally correct, tightened to the
  clean ratio.

The `effect`/`emotion` Greek performance-character labels
(παραλλαγή, πομπικός, σκηνικός, δρόμιος, βάσιμος, ἀναπαιστικός) are
application-defined descriptive labels. They do not supply historical
evidence for a timing, pitch, or velocity rule.

---

### Genera: enharmonic quarter-tones

**Claim:** Archytas' enharmonic genus ratios (28:27, 36:35) match the
code's `[63, 49]` cents values.

**Primary source, directly verified. ** Ptolemy,
*Harmonics* I.13, "On Archytas' Division of the Genera and the
Tetrachords" [31.11]: "1890 will be the second from the highest in the
enharmonic genus, for this in proportion to 1944 makes the 36:35
ratio, and in proportion to 1512 makes the 5:4 ratio" — i.e. Archytas'
enharmonic tetrachord divides as 28:27, 36:35, and a remaining 5:4
(pure major third). Ptolemy's own summary table [31.6, n.215] gives
this directly: "enharmonic — 28:27, 36:35, 5:4." In cents: 28:27 ≈
62.96¢, 36:35 ≈ 48.77¢ — matches the code's `[63, 49]` exactly.

**Translation consulted.** Solomon, Jon (trans.). *Ptolemy Harmonics:
Translation and Commentary.* Book I, ch.13, pp.43–44.

**Additional context, not itself implemented but worth recording.**
Ptolemy does not present Archytas' division neutrally — I.14 ("Proof
That Neither of These Divisions Preserves the Real Emmelic Interval")
argues Archytas constructed his enharmonic and chromatic tetrachords
"contrary to theory" and "contrary to the clarity of perception,"
specifically faulting the 36:35 ratio as smaller than the pyknon
convention allows. Ptolemy's commentary tradition (Solomon ed., n.211)
also notes Archytas is "unique in maintaining the 28:27 (or any) ratio
throughout the three genera" — a distinctive, internally consistent
feature of his system specifically, not a generic ancient convention.
Neither point changes the ratio values implemented, but both are
relevant if this project's UI or documentation is ever read as
presenting Archytas' division as an uncontested ancient consensus
rather than one specific, debated proposal among several (see Tuning:
Pythagorean fifths, "Author's decision" note, for the fuller
comparison-of-alternatives context from the same source).

**Implementation:** `archytasIntervals = [63, 49, -63, -49]` cents,
enharmonic genus branch, `server/services/midi-generator.ts` (~line 1420).

---

### Genera: chromatic pyknon

**Claim:** Hagel establishes the 100+100¢ pyknon of the tonic chromatic. The project's ±1-semitone accent operation on accented syllables is an artistic/algorithmic representation inspired by that interval structure, not a direct implementation of the ancient chromatic genus itself (the ancient pyknon is a structural property of the tetrachord, whereas the ±1-semitone operation is an implementation gesture).

**Source, via Hagel's table (reference only).** Hagel, Stefan. *Ancient
Greek Music: A New Technical History.* Cambridge, 2009, p.153. Tonic
chromatic: ½+½+1½ tone (100+100+300¢) — a 2-semitone pyknon below a
3-semitone step.

**Full shade table (Hagel, p.153):**

| Shade                                                         | Tones  | Cents       |
|---------------------------------------------------------------|--------|-------------|
| Enharmonic (Aristoxenus' own — distinct from Archytas' above) | ¼+¼+2  | 50+50+400   |
| Soft chromatic                                                | ⅓+⅓+1⅚ | 67+67+367   |
| Hemiolic chromatic                                            | ⅜+⅜+1¾ | 75+75+350   |
| Tonic chromatic                                               | ½+½+1½ | 100+100+300 |
| Soft diatonic                                                 | ½+¾+1¼ | 100+150+250 |
| Tense diatonic                                                | ½+1+1  | 100+200+200 |

**Implementation:** live chromatic-genus code applies a deterministic
±1-semitone pyknon step on accented syllables (`midi-generator.ts`).

**The other four shades — implemented.** All four remaining rows of
the table above are selectable genus options (`shared/schema.ts`
`genus` enum: `enharmonic_symmetric`, `chromatic_soft`,
`chromatic_hemiolic`, `diatonic_soft`), each applying the same kind of
deterministic pitch nudge on accented syllables as tonic chromatic
above, sized to that shade's specific pyknon cents from the table:
±50¢ (enharmonic, symmetric — vs. Archytas' asymmetric 63/49¢ for the
existing `enharmonic` option), ±67¢ (soft chromatic), ±75¢ (hemiolic
chromatic). Same honesty framing as tonic chromatic — an artistic/
algorithmic representation of each shade's characteristic interval,
not a tetrachord reconstruction. **Soft diatonic is a further step
removed:** diatonic genus has no pyknon in the structural sense
chromatic/enharmonic do (no pair of intervals smaller than the third),
so there's no equivalent ancient structural feature to represent with
this project's nudge mechanism. The ±50¢ nudge implemented for
`diatonic_soft` represents the 50-cent difference between soft (150¢)
and tense (200¢) diatonic's middle interval — this project's own
choice of what to represent and how, not a direct ancient encoding of
anything. All four are purely additive new options — the existing
`diatonic`, `chromatic`, and `enharmonic` defaults are unchanged.
**UI labels deliberately avoid Hagel's name** (per the project's
no-scholar-names-in-UI rule) and each carries a "(modern realization)"
qualifier, since these shades' subtle cent-level differences don't
read as obviously "ancient-sounding" distinctions to an untrained ear
and shouldn't be presented as if they would.

*Fixed (dead code, zero runtime effect, fixed for consistency per
project policy — not because this affects any live output).* The code
previously described here as "Diatonic genus (`[0,2,4,5]`) matches the
tense diatonic shade above" did not — `[0,2,4,5]` was tone-tone-semitone
(200+200+100¢), the reverse order from Hagel's tense diatonic (½+1+1 =
100+200+200¢, semitone-tone-tone) in the table above. Separately,
`tetrachordPatterns.chromatic` (`[0, 1, 3, 5]` → 100+200+200¢) matched
no chromatic shade at all — it was identical to tense diatonic's
*correct* pattern, as if the diatonic and chromatic entries had their
shapes crossed. `tetrachordPatterns.enharmonic` (`[0, 0.5, 1, 5]` →
50+50+400¢) was already correct — exactly "Enharmonic (Aristoxenus'
own)" — and is unchanged. **All three are corrected** to
`diatonic: [0, 1, 3, 5]` (100+200+200¢) and `chromatic: [0, 1, 2, 5]`
(100+100+300¢), matching the table above exactly. Both duplicated
copies (inside `generateTetrachordNote_OLD()` and the class field used
by `generateTetrachordNote()`) updated identically. This table is
`tetrachordPatterns` inside/adjacent to `generateTetrachordNote()`,
confirmed not called anywhere in the live pipeline (dead code) — see
Genera: diatonic (Dorian), below, for the array that *is* live.

---

### Genera: diatonic (Dorian)

**Claim:** `this.modes.dorian`'s lower tetrachord is semitone-tone-tone
(`[0,1,3,5]`), matching Hagel's tense diatonic shade and the standard
"Dorian type" convention (smallest interval at the low end).

**Source (reference only — editorial commentary, not a direct
Aristoxenus or Plutarch quote on this specific dispute).** Weil, Henri,
and Théodore Reinach. *Plutarque: De la Musique.* Paris, 1900. Note to
§107:

> For simplicity, we can consider these tetrachords as always having the
> "Dorian" type (the smallest intervals at the bottom).

*Gloss:* for simplicity, [ancient Greek] tetrachords can be considered
as always having the "Dorian" type — the smallest interval at the low
(grave) end.

For a diatonic tetrachord (semitone + tone + tone), "smallest interval
at the low end" means semitone-tone-tone from the bottom note upward —
consistent with Hagel, *Ancient Greek Music* (2009), p.153 (tense
diatonic, ½+1+1 = 100+200+200¢, semitone-first) — see the shade table
in the chromatic entry above.

**Implementation:** `this.modes.dorian` changed from `[0, 2, 3, 5, 7,
9, 10]` to `[0, 1, 3, 5, 7, 9, 10]` (`midi-generator.ts`). Real
runtime/audio output change — signed off before implementing.
`tetrachordPatterns.diatonic` (`[0,2,4,5]`, dead code, see correction
in the chromatic entry above) was not touched — still doesn't match
either ordering, but isn't called anywhere live; left as deprecated.

---

### Genera: deferred Archytan tetrachord reconstruction

The application currently applies genus information as documented pitch
emulation, not as a complete tetrachordal pitch framework. A future,
explicitly interpretative Archytan reconstruction is academically
possible but is deliberately deferred; its proposed implementation is
recorded in TODO.md, Deferred item 3.

**Sources establishing the framework.** Aristoxenus' *Harmonic
Elements*, summarized in Marchetti, pp.22–25, defines a tetrachord as
four notes spanning a fourth with fixed outer and moveable inner notes.
Ptolemy, *Harmonics* I.12 (Solomon, pp.40–42), independently describes
the same distinction and genus as the placement of the moveable notes.
Hagel, *Ancient Greek Music* (2009), pp.34–35, explains this
tetrachordal organisation and warns that real practice used varied
shades rather than one universal division.

**Archytan evidence and limit.** Ptolemy, *Harmonics* I.13 (Solomon,
pp.43–44), supplies Archytas' ratio-based divisions, including the
enharmonic 28:27 × 36:35 × 5:4. This supports an Archytan
reconstruction as one theoretical system. It does not establish that
one software register, concatenation scheme, generated-note policy, or
combination with a named ethos was historically universal.

**Compatibility policy for a future implementation.** An Archytan
framework would replace the current genus emulation and the additive
Pythagorean correction for its pitch pool. It would be distinct from
the current qualitative ethos selector; a Ptolemaic tonos could only
transpose the completed framework and must be presented as a
theoretical combination, not an attested repertory pairing. Aristides
Quintilianus and Nicomachus are not used to supply unspecified
tetrachord values: the former is contextual corroboration here, and
the latter numerical background only.

---

### Modal Tonoi/ethos (ethosIntervals)

### Ptolemaic tonoi (default technical pitch framework)

**Claim:** Ptolemaic tonos and qualitative ethos are two historically
distinct, alternative pitch approaches in this application. Selecting
one excludes the other. The default `experimental.tonos` is Dorian; the
selector implements seven Ptolemaic tonoi as pitch-position transpositions around
Dorian; it does not use them as octave-species arrays or as numerical
ethos values.

**Primary source, directly verified.** Ptolemy, *Harmonics* II.10
[62.16–64.11], Solomon trans., pp.88–91, orders the seven tonoi from
high to low as Mixolydian, Lydian, Phrygian, Dorian, Hypolydian,
Hypophrygian, Hypodorian. Their successive intervals are leimma, tone,
tone, leimma, tone, tone. II.11 [64.16–65.15], pp.91–92, places Dorian
at the middle and relates the seven positions to distinct dynamic
placements of *mese*. The code renders a tone as 9:8 and a leimma as
256:243 (established earlier in *Harmonics*), converting those ratios
to cents solely for MIDI pitch-bend output.

**Scope and limit.** `"none"` is the internal opt-out used when the user
chooses interpretive ethos; it is not a separate item in the Ptolemaic-tonos
dropdown. The current default is Dorian. When a non-`"none"` tonos is
selected, it transposes the primary rhythm/melody track over the project's
Dorian genus baseline; it does not use an `ethosIntervals` dyad. Ptolemy does
not prescribe how a tonos should combine with this project's separate,
qualitative ethos mapping, so the UI makes the two approaches mutually
exclusive rather than offering unsupported pairings.

**Implementation:** `ptolemaicTonosCents` and
`getPtolemaicTonosAdjustment()` in `midi-generator.ts`; the visible
selector and compatibility warning are in `experimental-panel.tsx`.

---

**Claim:** `ethosIntervals` (`dorian: [0,5]`, `phrygian: [0,1]`, etc.)
is an algorithmic/artistic translation of ancient qualitative modal
ethos into a two-note musical interval — not a direct ancient numeric
encoding, because no ancient source encodes ethos numerically.

**Five independent sources, all qualitative-only, none
numeric:**
- Pseudo-Plutarch, *De Musica* (Weil & Reinach critical edition, Greek
  text + French translation): Lydian ὀξεῖα καὶ ἐπιτήδειος πρὸς
  θρῆνον ("sharp/high-pitched and suited to lament," §148), Mixolydian
  παθητική τίς ἐστι, τραγῳδίαις ἁρμόζουσα ("affecting, fitting for
  tragedies," §153), Dorian repeatedly praised for τὸ σεμνόν (gravity,
  solemnity, §164–165). Authorship disputed (Siamakis: Plutarch of
  Athens, c. 4th–5th c. CE; Lasserre: Dionysius of Halicarnassus, 2nd–3rd
  c. CE; Gibson: 1st–2nd c. CE) — treated as "Pseudo-Plutarch," date
  range c. 1st–5th c. CE.
- Aristotle, *Politics* VIII, 1342a31–33 (criticizes Plato's *Republic*
  for retaining Phrygian alongside Dorian while rejecting the aulos)
  and 1341a18–20 (rejects the aulos and other professional-skill
  instruments from education) — Greek text + Barker's translation, via
  Mystrioti's paper. **1340b, directly verified,
  independent of and additional to the two passages above:** "the one,
  for instance, occasions grief and contracts the soul, as the mixed
  Lydian: others soften the mind, and as it were dissolve the heart:
  others fix it in a firm and settled state, such is the power of the
  Doric music only; while the Phrygian fills the soul with
  enthusiasm." The specific mode-by-mode characterization (Lydian
  grief-inducing, Dorian settled/firm, Phrygian enthusiasm-inducing)
  previously known only via the later 1342a/1341a passages' more
  general framing — this is Aristotle's own direct statement of it,
  closing what was an open sourcing gap.
- Plato, *Republic* III, 398e–399a — the
  ur-source Ps.-Plutarch and Aristotle both respond to. Dorian is the
  harmonia of a brave man's resolve in danger and his temperance in
  peace; Phrygian is retained alongside it; Mixolydian, tense Lydian,
  and (relaxed) Ionian/Lydian are rejected as suited to lamentation,
  drunkenness, and indolence. No interval given for any mode.
- Aristides Quintilianus, *De Musica* 1.9 (Winnington-Ingram edition,
  Greek text), paraphrasing the same Republic passage:
  Mixolydian/tense-Lydian are θρηνώδεις ("threnodic"), Ionian/Lydian
  are συμποτικὰς καὶ λίαν ἀνειμένας ("sympotic, very relaxed"),
  Dorian/Phrygian alone left over.
- Bacchius the Elder, *Introductio Artis Musicae* §54 (Ruelle's French
  translation), defines *metabolē kata ēthos* entirely
  qualitatively — simple↔grandiose, calm↔agitated — no numeric
  interval.
- Gaudentius, *Harmonic Introduction* (Ruelle's French translation, on
  hand): general confirmation that ethos denoted moral/psychological
  character throughout the tradition — corroborating context, not a
  source for any specific interval.

**What none of the above supplies:** the specific numeric semitone
values in `ethosIntervals`. All five sources describe modal ethos
qualitatively; converting that into two-note arrays like `dorian:
[0,5]` is this project's own algorithmic synthesis, not a direct
ancient encoding — same honesty pattern as `nomos_apollonian` below.

*Aside note (not implemented, not a claimed basis).* Christian Meyer
(ed.), *Collectae glossae in De nuptiis Philologiae et Mercurii
Martiani Capellae (Liber IX)* (HAL, 2013), gloss 184 and the following
block: a 15-tonoi list (Ypodorius…Yperlidius) with each tonos's mese
given as "acquired" (*adquisita*) from another tonos in the set, plus
a transposition-system diagram. 9th/10th-c. Carolingian commentary
transmitting late-antique tonoi material — one step removed from a
primary source like Alypius, not itself Pseudo-Plutarch or Aristotle.

**Implementation:** `ethosIntervals` table, `midi-generator.ts` — full
citation comment at the implementation site.

---

### Ethos-instrument mapping

**Claim:** mode → instrument selection is grounded in Plato's
*Republic* and Aristotle's *Politics*.

**Plato's *Republic*, III 398e–399a and 399c–d, both directly verified
(Jowett/Lawton translation).** 398e–399a: Socrates rejects
Mixolydian and syntonolydian as "dirge-like," keeps only Dorian and
Phrygian for the guardians. Immediately following, 399c–d: having
settled on Dorian/Phrygian only, Socrates rejects "the artificers of
lyres with three corners and complex scales, or the makers of any
other many-stringed, curiously harmonized instruments," then extends
this explicitly to the aulos: "what do you say to flute-makers and
flute-players? Would you admit them into our State when you reflect
that in this composite use of harmony the flute is worse than all the
stringed instruments put together?" — also rejected. Conclusion:
"There remain then only the lyre and the harp for use in the city, and
the shepherds may have a pipe in the country." This is the primary-text
basis for the mode→instrument tension Aristotle addresses at *Politics*
1342a31–33 — Plato rejects the aulos outright while still keeping
Phrygian (the mode conventionally associated with aulos music), which
is exactly what Aristotle calls out as inconsistent.

**Aristotle's *Politics*, Book VIII, directly verified — both
the specific passage and its wider context.** 1342a31–33 addresses the
mode-instrument tension directly (Phrygian ~ aulos). The surrounding
chapters (1341a) give Aristotle's extended argument against
teaching children the aulos: "they should never be taught to play upon
the flute, or any other instrument which requires great skill... the
flute is not a moral instrument, but rather one that will inflame the
passions... the player on the flute is prevented from speaking" (a
practical objection: the aulos requires breath control that precludes
simultaneous speech, blocking sung/verbal instruction). Aristotle also
records earlier Greek practice moving away from the aulos "having
become better judges of what tended to promote virtue and what did
not" — a historical claim about changing taste, useful context but not
itself a source for this project's implementation.

**Implementation:** mode/instrument association logic in
`midi-generator.ts` and `experimental-panel.tsx` default-setting
switches.

---

### Methodology: three-layer architecture

**Claim:** Duration Tablature / Accent Tablature / Vocal Guide is the
architecture for this pipeline.

**Source (full paper read; reference only).** Mota, Marcus (University
of Brasília). "Meter and Representation: Creating Audio Files and Midi
from Greek Tragedy Texts." The paper describes "three different systems
for a timeline of events": (1) an audio register of a vocal
interpretation of the Greek text, guided by the duration tablature; (2)
that same tablature transcribed into conventional rhythmic notation and
linked to a MIDI track using a non-melodic percussive sound (hand
claps) for the durations; (3) a separate MIDI track, also percussive
(acoustic bass drum), marking only the word-accents. Mota develops this
specifically for the anapaest, showing durations and melodic accents
can fall out of sync with each other within the same phrase.

**Implementation:** the three layers structure the MIDI generation
pipeline throughout this project — a duration track, an accent track,
and a vocal guide, matching Mota's three-system model.

---

### Aulos breath control (addAulosBreathControl) — deferred, disabled

**Status: experimental, deliberately deferred, not currently active.**
Aulos players needing to breathe is a real physical fact of the
instrument, but the specific implementation here (a pause inserted at
70% of a 12-note phrase) is not sourced to any ancient testimony about
aulos breath-control timing — this project's own unsourced attempt at
representing the concept. Prior listening tests found it didn't sound
right, and its rhythmic delay conflicted with Mota's synchronized-track
methodology (see "Methodology: three-layer architecture," above) —
inserting a pause on one track without correspondingly adjusting the
others broke the intended synchronization between the duration,
accent, and vocal-guide layers. Currently, disabled (the call site is
commented out, not deleted) for zero sound change while deferred.

**A relevant, but not fully verified, lead on the broader question.**
Whether ancient Greek aulos players used circular/continuous breathing
at all — which bears on whether *any* breath-pause mechanism is even
the right model — is genuinely contested in scholarship, not settled
either way. Confirmed independently (web search, not West directly):
Britannica's aulos entry is notably cautious — "classical writers make
few clear references to technical details for modern scholars to
determine... how the instrument was played" — describing the
cheek-bulging visible in ancient depictions as a modern *interpretation*
("the player uses nasal (or circular) breathing"), not an explicit
ancient textual claim. Several more popular sources state circular
breathing as settled fact without the same caution. No directly consulted
source in the project currently establishes whether ancient aulos performance
used circular or continuous breathing, or how breathing affected rhythmic phrasing.
The question therefore remains deferred. The current application does not model
aulos breath control, and no claim about ancient breath-control practice is made.

See `docs/TODO.md`, "Aulos breath control."

---

### Antiochene scenic listening model: evidence and limits (current)

**Supported context.** Libanius' *Oration* 64 and the modern pantomime
research support Late Antique theater as a setting for gesture,
pose, song/chorus, instrumental accompaniment, pulse/time-keeping, and
the coordination of movement with music. Gerolemou's "Some Thoughts on
the Mechanical Features of Pantomime Dancers" treats Libanius' oration
as evidence for pantomime's kinaesthetic and rhetorical dimensions; it
does not supply numeric playback rules. Choricius' *Apology of the
Mimes* is relevant performance context, not a recoverable musical score.
Lucian, On Dancing §6 presents dance in relation to music and rhythm;
it is a general second-century precedent, not evidence for late-antique Antiochene practice.

Hall and Wyles (eds.), *New Directions in Ancient Pantomime* (Oxford,
2008), is the strongest supplied secondary source for this feature. It
places Libanius' *Oration* 64 in Antioch, records theater there as a
setting for pipes, lyre, voice, and stage performance (pp.16–18), and
describes accompaniment by chorus/instruments and the scabellum's
time-keeping role (pp.4, 25–27). Ruth Webb's chapter relates movement,
gesture, pose, chorus-song metre, and the audible beat (pp.50–52), while
stressing that fragmentary evidence does not recover choreography or a
score.

Mathiesen, *Apollo's Lyre* (1999), documents ancient dramatic
antiphonal exchange and ancient melismatic practice (pp.108, 124,
130–131). These are general precedents, not evidence for a particular
Antiochene response pattern or ornament. Barker, *Greek Musical
Writings* (1984), reinforces the methodological limit: theoretical
harmonics and rhythm alone do not establish performance
appropriateness or a complete composition.

**Implementation and disclosure.** `antiochene_scenic` is an
**interpretative listening model**, not a reconstruction. The UI labels
its melismatic, antiphonal, and pantomime options as interpretative.
Ptolemaic tonos is independently sourced as a transposition theory, but
its combination with this model is explicitly marked exploratory. The
response delay/durations, generated pitches, velocities, and ornament
timings are application choices; no reviewed source supplies those
numeric rules.

**Melisma repair.** The primary rhythm event is emitted once per
syllable. `addAntiocheneOrnamentation()` adds ornaments only, and every
ornament has a matching note-off. This is an engineering correction to
duplicate/stuck MIDI events, not a historical claim. It is covered by
`tests/midi-generator.test.ts`.

---

### Vitruvius: hydraulis and theater acoustics (echeia)

**Claim:** Vitruvius, *De Architectura*, describes both the hydraulis
(water organ) mechanism and theater acoustics via resonance vessels
(*echeia*).

**Citation.** In the academic-footer.tsx entry, the
*echeia*/acoustics material actually spans Book V, chapters iii–v:
chapter iii covers the physics of voice propagation (compared to
concentric water ripples), chapter iv introduces harmonic theory via
Aristoxenus ("ut potuero quam apertissime ex Aristoxeni scripturis
interpretabor"), and chapter v gives the detailed technical
prescription — bronze vessels tuned to the diatonic, chromatic, and
enharmonic genera, arranged in tiers under the theater seating,
"combined into musical symphonies or concords: the circle of seats
being divided into fourths and fifths and the octave." A separate,
brief mention of *echeia* also occurs at Book I, ch.1 (§9), in
Vitruvius' general list of what an architect must know.

**Hydraulis, Book X.viii ("De hydraulicis," "On Water Organs").** Describes the mechanism in
detail: a bronze vessel on a wooden base, paired bronze cylinders with
pistons worked by levers, valved bronze "dolphins" (*delphini*) over
the cylinder openings, an inverted-funnel air-vessel (*pnigeus*)
smoothing the pressure, and the "canon musicus" pipe rack — four
channels if tetrachord, six if hexachord, eight if octochord. Frank
Granger's Loeb edition/translation is the text consulted.

**Implementation:** `hydraulis: 19` in `pantomimeInstruments`
(`midi-generator.ts`) — a General MIDI patch number (organ family),
not itself a sourced value; the source supports that a hydraulis
existed and how it worked, not which modern MIDI patch should
represent it. It is deliberately not selectable through the current
schema or general instrument selector.

**Echeia/theater acoustics — cited in the UI, zero implementation.**
No code anywhere computes or represents resonance-vessel tuning,
theater seating acoustics, or anything from Book V.iii–v. This is a
citation with no corresponding claim in `midi-generator.ts` at all,
not even a dead entry.

---

### Seneca: scabellum (passage not yet pinpointed)

**Claim:** Seneca, *Epistulae Morales*, references the scabellum
(foot-clapper used to cue tempo, chiefly for pantomime dancers and
choruses) in theatrical/musical performance contexts.

**Status: content plausible, exact passage not located.** Multiple
targeted searches of the letter collection did not surface a
scabellum passage specifically. The scabellum itself is a genuine,
well-attested Roman theatrical instrument (a hinged wooden or metal
sole strapped to the foot, used by the *scabellarius* to mark
rhythm), so the general claim is plausible, but it is not yet
confirmed against this specific source. If the exact letter/section
is known, citing it directly would resolve this.

**Implementation:** `scabellum: 76` in `pantomimeInstruments`
(`midi-generator.ts`) — a General MIDI patch number, not itself a
sourced value. It is deliberately not selectable through the current
schema or general instrument selector.

---

### Alypius: notation tables (background, not an implementation source)

**Claim in footer:** "Technical manual on notation and modal systems;
foundation for pitch and scale mapping."

Alypius' *Eisagōgē Mousikē* (in the Ruelle French collection) is
genuinely a systematic notation manual — per-*tropos* (mode), per-genus
(diatonic/chromatic/enharmonic) tables mapping each scale
degree to its ancient notation symbol, for all fifteen tonoi. This is
real and substantial. However, Alypius' tables give notation *symbols*
for a pitch system whose actual interval structure is established
elsewhere (Aristoxenus, Hagel, etc.) — he does not himself supply
tuning ratios or interval sizes. Zero references to Alypius exist
anywhere in `midi-generator.ts` or any other `PROVENANCE.md` entry;
the implemented `modes`/scale intervals are sourced to Hagel (Dorian
tetrachord) and Aristoxenus/Ptolemy (genus ratios) elsewhere in this
document, not to Alypius. The footer's "foundation for pitch and
scale mapping" phrasing should be read as background/context — Alypius
confirms *that* a rigorous notation system existed, not the specific
numbers this project implements.

---

### Delphic Hymns

**Claim in footer:** "Rare surviving examples of notated Greek music whose text and notation permit unusually detailed analysis of melodic contour and metrical rhythm".

**Confirmed directly — genuine notated fragments, with the same
rhythmic data already used elsewhere in this document.** Fairbanks,
*A Study of the Greek Paean*, Appendix II, transcribes the
actual musical symbols of the First and Second Delphic Hymns to Apollo
into modern notation (pitch letter equivalents given directly against
the ancient symbols), and reports Crusius' count of rhythmic-foot
resolutions in the hymns' cretic/paeonic meter: cretic 43 (reduced to
25 once long syllables split by the music are accounted for), first
paeon 17 (→20), fourth paeon 16 (→28), orthios 4 (→7). This is the
same underlying frequency data referenced via West's Ex.5.3 in the
"Rhythm: Delphic paeonic patterns" entry above — Fairbanks and West
draw on the same hymn material independently.

---

### Rhythm: nomos_apollonian five-section structure (qualitative, interpretive)

**Claim:** the `nomos_apollonian` rhythmModel branch implements a
five-section structure matching the *Pythikos Nomos*'s documented
programmatic content, with distinct tempo/duration character per
section.

**Ancient basis for the five-part structure and its content.** Strabo,
*Geography* IX.3.10; Pollux, *Onomastikon* IV.84 (via Barker,
*Greek Musical Writings* vol.1, pp.51–52); West, *Ancient Greek
Music*, pp.212–213, which
gives the fullest surviving descriptive content per section — Peira
(surveying the ground), Katakeleusmos (challenging the serpent),
Iambikon (the fight, including the documented "tooth action" playing
technique), Spondeion (stately victory libation), Katachoreusis
(joyful dance) — plus an expanded citation base (Poll. 4.84, Strab.
9.3.10, Hypothesis to Pindar's *Pythian* Odes, Xen. *Symp.* 6.5,
Paus. 2.22.8–9/10.7.4, Ps.-Plut. *De Musica* 1134a).

**No source gives numeric ratios or durations for any section** —
confirmed directly against West's own text, not just inferred from
Strabo/Pollux's silence. West is explicit that sources "do not
altogether agree on the details."

**Implementation — explicitly interpretive, not sourced ratios.** The
verse is divided into five sequential sections by proportional index
position (`Math.floor((index / totalNotes) * 5)`), in Pollux's order:
- **Peira** — constant ratio 1.15 (deliberate/exploratory, matching
  West's "surveys the ground").
- **Katakeleusmos** — ratio decreasing linearly 1.1→0.9 across the
  section (building intensity toward the challenge).
- **Iambikon** — short-long alternation at the already-sourced
  Aristoxenian iambic double ratio (2:1 — Aristoxenus, *Elementa
  Rhythmica* II.30, see "Rhythm: Aristoxenian genus ratios" above),
  rather than an invented number, giving a combative/uneven texture
  standing in for the documented "tooth action" technique.
- **Spondeion** — constant ratio 1.7 (slow/solemn, consistent with
  West's own gloss "stately libation music" — not a separate claim
  about the spondaic rhythmic genus, which is not independently
  verified against a primary source here).
- **Katachoreusis** — constant ratio 0.65 (fast/light, "joyful
  dance").

This is this project's own realization of documented programmatic
content into audible character — the same honesty pattern as
`ethosIntervals` (Modal Tonoi/ethos, above): the *existence* and
*content* of the five sections is sourced, the specific tempo numbers
chosen to represent that content are not, and are not presented as
such. `baseUnit` (default 320) and the underlying
`weightedDuration`/480-tick conversion are unchanged from the prior
flat-ratio implementation.

---

### Rhythm-model listening presets: conservative defaults, not reconstructed pairings

**Current behavior.** Selecting any rhythm-model preset in
`experimental-panel.tsx` now sets Pythagorean fifth tuning and the
diatonic genus. This is a single conservative application listening
baseline, not a claim that every historical repertory represented by a
model used that exact tuning-plus-genus combination. A user may choose a
different genus afterward; the existing enharmonic warning continues to
identify Pythagorean-plus-enharmonic as an experimental synthesis.

**What is sourced for each preset.** The sources substantiate the
rhythmic material or historical context, with the following limits:

- `chronos_ratios`: Aristoxenus, *Elementa Rhythmica* II.30, §20,
  establishes the equal, double, and hemiolic rhythmical ratios; it does
  not assign a tuning or genus to this application's generated output.
- `delphic_paean`: West, *Ancient Greek Music* (1992), pp.140–142,
  and Aristides Quintilianus, *De Musica* 1.15–17, support the paeonic
  patterns and quintuple-time structure. Hagel, *Ancient Greek Music: A
  New Technical History* (2009), p.20, notes that the two Delphic Paeans
  use related openings while being notated in different tonoi. Neither
  source supplies the preset's exact tuning-plus-genus pairing.
- `sapphic_lyric`: West, *Ancient Greek Music* (1992), pp.148–150, and
  *Introduction to Greek Metre* (1987), pp.33–35, support the implemented
  6/8–6/8–10/8 line structure, not a fixed pitch pairing.
- `nomos_apollonian`: West, *Ancient Greek Music* (1992), pp.211–213,
  together with Strabo, *Geography* IX.3.10 and Pollux, *Onomastikon*
  IV.84, supports the Pythikos Nomos's five-section program, not a
  fixed pitch pairing.
- `euripidean_flow`: West, *Ancient Greek Music* (1992), pp.142–144,
  supports the tragic dochmiac context and variability represented by the
  rhythm model. It does not make Pythagorean fifths plus any particular
  genus an attested reconstruction.
- `antiochene_scenic`: Libanius, Choricius, and Lucian provide the
  general performance context recorded in "Antiochene scenic listening
  model: evidence and limits" above; none supplies a tonos, tuning, or
  genus pairing.
- `heraclitean_pulse`: its timing formula is an explicitly creative
  application feature, not a historical repertory reconstruction.

**Pitch evidence used for the shared baseline.** Pythagorean fifths are
documented in "Tuning: Pythagorean fifths" below. Hagel (2009), p.153,
gives the tense diatonic division (½ + 1 + 1 tones) represented by the
application's Dorian diatonic baseline. These sources make the defaults
historically informed, but do not establish their use as a universal or
model-specific ancient combination.

---

### Tuning: Pythagorean fifths

**Claim:** stacked pure 3:2 fifths; comma constant 23.46¢.

**Basis:** Pythagorean tuning tradition (3:2 fifth, 2:1 octave) — same
ratio family as Archytas/Ptolemy above. Verified by direct calculation:
(3/2)¹² ÷ 2⁷ = 1.013643 = 23.4600¢ exactly.

**Implementation:** `calculatePythagoreanFrequency()`, applied via
MIDI pitch-bend on the final note in `createRhythmTrack` — uniform
across melody, non-melody, and default arsis/thesis-marked syllables.
underlying interval generator is based on 3:2 fifths; when the 12-fifth
cycle is completed, the implementation distributes the Pythagorean comma
across that cycle (`Math.trunc(fifths / 12)`), so the resulting cycle is
a tempered approximation rather than twelve mathematically exact 3:2
fifths (historical Pythagorean tuning leaves one audible "wolf" interval
instead of smoothing). MIDI pitch-bend is absolute per channel; when this
correction and an Archytas quarter-tone pitch-bend both apply to the same
syllable, their cents offsets are summed into a single combined
`pitch_bend` event (cents are logarithmic and additive, so summing is
mathematically correct) rather than pushed as two separate same-tick
events, which would otherwise collide — see `TODO.md` Item 0.

**Author's decision — the combination itself is a modern synthesis, not
an attested ancient practice.** The arithmetic fix above (summing
cents into one event) is a claim about arithmetic — additive cents is
the mathematically correct way to combine two simultaneous
corrections, given that the software allows both
`tuningSystem: "pythagorean"` and enharmonic genus to be selected at
once. It is not a claim that ancient practice combined these two
systems on the same note. Structurally, they answer different
questions: Pythagorean tuning (stacked 3:2 fifths) generates the fixed/
standing pitches of the gamut, genus-independent; Archytas' 28:27/36:35
ratios (Ptolemy, *Harmonics* I.13, cited above) describe how the
*moveable* inner notes of a tetrachord divide specifically for the
enharmonic genus — two different structural questions, not two layers
of the same one.

**Confirmed directly against Ptolemy's primary text.** *Harmonics*
I.12–13 and II.13–14, and the corresponding Book
II comparison tables, lay out Archytas', Aristoxenus', Eratosthenes',
Didymus', and Ptolemy's own tetrachord divisions as parallel columns —
one complete, self-contained division per theorist, per genus
(enharmonic, chromatic, diatonic) — explicitly organized "along
theoretical, not chronological considerations" for comparing
alternatives against each other, not for combining them. Archytas'
system is presented as internally complete on its own terms: he is
noted as "unique in maintaining the 28:27 (or any) ratio throughout
the three genera" — a consistent feature of *his* system specifically,
not a component meant to be paired with a separately-generated
Pythagorean-fifths framework. Nowhere in the material received does
Ptolemy combine a fifths-generated tuning framework with a named
theorist's genus ratios; every named system stands as its own
alternative. Separately, Archytas' ratios are also not 3-limit
(Pythagorean) ratios — 28:27 and 36:35 both involve the prime 7 — so
combining a Pythagorean correction with an Archytas interval layers
two systems that are, in that specific sense, in tension with each
other rather than complementary. The software permits selecting both
systems for experimental exploration and labels the result accordingly.
The combined output is internally consistent (additive, not colliding)
rather than silently dropping one correction. This project's combination
of the two should be understood as its own synthesis, not
Ptolemy's or any ancient author's. **UI policy:** the combination remains
available for experimental exploration, with an in-context warning in
`experimental-panel.tsx`. For `enharmonic`, the warning is grounded in
Ptolemy, *Harmonics* I.13 and II.13–14; for `enharmonic_symmetric`, it
identifies Hagel's distinct Aristoxenian 50+50+400-cent reconstruction
(Hagel, *Ancient Greek Music*, 2009, p.153). Neither UI path presents
its microinterval realization as an attested layer on Pythagorean fifth
tuning.

---

### Thesis/Arsis marking

Applies in both melody and non-melody modes: a symmetric ~1-semitone
pitch contrast (arsis raised, thesis lowered), applied on top of
whatever pitch was already selected, no dynamic/velocity component.

**Claim:** arsis/thesis is marked by a pitch contrast (arsis raised,
thesis lowered), not by dynamic (volume) accent.

**Primary source.** Martianus Capella, *De Nuptiis
Philologiae et Mercurii* IX.974:

> arsis est elatio, thesis depositio uocis ac remissio

*Gloss:* arsis is a raising, thesis a lowering and relaxation, of the
voice.

**Primary source, quoted directly by Lynch.** Aristides
Quintilianus, *De Musica* I, 31.8–17 Winnington-Ingram:

> ἄρσις μὲν οὖν ἐστι φορὰ μέρους σώματος ἐπὶ τὸ ἄνω, θέσις δὲ ἐπὶ τὸ
> κάτω ταὐτοῦ μέρους.

*Gloss:* arsis is the upward motion of a part of the body, thesis the
downward motion of the same part.

The Martianus Capella line above (IX.974, "arsis est elatio, thesis
depositio uocis ac remissio") is closely derived / translated from this
same Aristides passage — Martianus's *De Nuptiis* Book IX translates
extended sections of Aristides' *De Musica* with minor additions; §974
specifically renders Aristides' definition of the rhythmical foot
(*De Musica* I, 33.12–13 W.-I.) and its two parts.

**Source: Lynch, Tosca A. C. "Arsis and Thesis in Ancient Rhythmics and
Metrics: A New Approach."** *The Classical Quarterly* 66.2 (2016),
491–513. Central argument, built from Aristides Quintilianus
31.8–17 and 82.4–6 W.-I. (arsis = ψόφος/"sound"/aesthetically marked,
thesis = ἠρεμία/"calm"), Herophilus's pulse-rhythm analogy as
transmitted by Galen (*Syn. Puls.* 9.464, arsis = arterial dilation
marked by a perceptible beat, thesis = contraction/calm), and the
Aristotelian *Problems* (19.49) on high pitch as inherently "moving"
(κινητικός) and low pitch as "soft and calm": rhythmical prominence
was conveyed by *melodic* (pitch) accent, not dynamic/volume accent —
corroborated by Aristides Quintilianus via the *stigmē* (dot) notation
marking arseis, not theseis, in ancient scores (Lynch p.497 n.22,
citing *Anonyma Bellermanniana* §3; West, *Ancient Greek Music* p.268;
Winnington-Ingram, "Fragments of unknown Greek tragic texts with
musical notation," *SO* 31 [1955], 29–87; Hagel, "Ancient Greek
Rhythm: The Bellermann Exercises," *QUCC* 88 [2008], 125–38).
Distinguishes this *rhythmical* sense of arsis/thesis (elatio/depositio,
pitch-based) from a later, unrelated *metrical* sense (sublatio/positio,
syllable-position-based scansion terminology that arose in Late
Antiquity for teaching verse-scanning, pp.505–8) — which sense this
project's `arsisThesisPattern` data represents was an open question —
**resolved: rhythmical.** This project's
`arsisThesisPattern` implements Lynch's *rhythmical* sense (elatio/
depositio, pitch-based), not the later metrical/scansion sense. This
is a deliberate authorial determination about this project's own data
and intent, not a claim derivable from the ancient sources themselves —
recorded here as the final word on an otherwise permanently
undecidable question.

**Checked directly against item 0's genus-override question,
resolved as a negative result:** Lynch's paper does not mention genus
or tetrachord selection anywhere — her argument is exclusively about
pitch vs. dynamic accent for arsis/thesis marking. Confirmed: nothing
in Lynch (2016) ties arsis/thesis to enharmonic/chromatic/diatonic
genus choice. The `effectiveGenus = "enharmonic"` force-override
whenever `arsisThesisPattern` is set (`midi-generator.ts`) has no basis
in this source and reads as an arbitrary implementation shortcut, not a
sourced choice.

**Gap resolved — two distinct findings, both confirmed against the
full primary text.**

1. **The 1-semitone magnitude is not itself sourced.** Lynch establishes
   *direction* only (arsis higher, thesis lower) — nowhere in the paper
   does she specify an interval size. Martianus Capella's "elatio"/
   "depositio" and Aristides' "upward"/"downward motion" are both
   qualitative. The specific choice of ~1 semitone is this project's own
   modest realization of that qualitative direction, not a number found
   in any source. Kept as-is (no better-sourced alternative number
   exists to replace it with), but the code comment and this entry
   say so explicitly rather than implying the magnitude itself is
   sourced.

2. **The duration-flatness default is not a claim from Lynch's
   ancient-evidence argument.** The disabled code comment's "no solid
   ancient evidence for dynamic/**durational** marking of thesis"
   conflated two different things. Lynch's paper does discuss duration,
   but only via a *modern music-psychology* citation (§1: experiments
   showing "temporal" accents — i.e. events marked by duration alone —
   are less perceptually effective at conveying rhythm than "melodic"
   accents) used to motivate *why* pitch is a plausible marker worth
   investigating. This is not an ancient-source claim that thesis
   receives no additional duration weighting. The default flat duration
   (`metricalWeight = 1.0`, `getArsisThesisDurationWeightLynch()`) is
   this project's own implementation choice — not layering an
   additional durational effect on top of pitch — consistent with
   Lynch's overall argument but not itself asserted by her. Kept as-is;
   documented accurately rather than overclaimed.

**Author's decision — kept deliberately, not a sourcing gap awaiting a
fix.** The `effectiveGenus = "enharmonic"` override is kept as-is,
deliberately, on aesthetic grounds, based on direct listening to the
result. To be
precise about what this does and doesn't mean, for any specialist
reader checking this project's claims against her own work:

- This is *not* a contradiction of anything Lynch (2016, 2020)
  actually asserts. She makes no claim at all about tuning-genus
  selection in connection with arsis/thesis — the two topics don't
  meet anywhere in either paper, confirmed above. There is nothing of
  hers to be right or wrong about here.
- It *is* an unsourced addition riding alongside a genuinely sourced
  mechanism. The core arsis/thesis pitch contrast (arsis raised,
  thesis lowered, no dynamic/velocity component — see Implementation
  below) is sourced to Aristides Quintilianus via Lynch. The forced
  switch to enharmonic genus on top of that is not sourced by Lynch,
  by any other source checked in this project, or by anything in the
  ancient tradition connecting rhythmic accent to tuning genus at all.
- A specialist would be right to ask why genus changes here, and the
  honest answer is: it doesn't follow from a source, it follows from
  how it sounds. That is a legitimate artistic choice for a music
  composition tool to make — this note exists so it's never presented,
  or mistaken by a reader, as a scholarly claim.

**What Lynch does *not* give:** a specific interval size. Her argument
is about direction (arsis = higher pitch, thesis = lower) and mechanism
(melodic, not dynamic) — she does not propose or imply a magnitude like
"one semitone." The `~1 semitone each side of baseline` figure in this
project's default implementation (below) is not from Lynch and remains
an unsourced implementation choice.

**Aside note (agreement on the general point, not corroboration of
Lynch's specific claim — see corroboration-vs-agreement policy
above).** Mota, "Meter and Representation" (see Methodology entry
above), states as settled background that Greek accentuation is
melodic/pitch-based rather than dynamic, citing Allen (1973), Devine &
Stephens (1994), and Probert (2006). This is the same general fact
about Greek prosody that underlies Lynch's argument, but Mota is not
addressing Lynch's specific claim about how *rhythmical* arsis/thesis
was marked, nor the rhythmical/metrical distinction Lynch draws — so
this does not independently verify Lynch's position, only the broader
linguistic premise it depends on.

**Implementation:** default arsis/thesis marking is a small symmetric
pitch contrast (~1 semitone each side of baseline — magnitude
unsourced, see above), applied on top of whatever pitch was already
selected — independent of the long/short (-/U) duration system, no
dynamic/velocity component, direction matches Lynch (arsis raised,
thesis lowered). The `noAccentFallback` toggle in the `experimental` panel
removes the pitch or velocity distinction for arsis/thesis entirely.

Full detail in code comments at each affected block in
`server/services/midi-generator.ts`.
---

## Primary Sources and Contemporary Authorities

1. Aristoxenus, *Elementa Rhythmica* II.30, §20, and *Harmonic
   Elements* tetrachord framework — via Marchetti's study (pp.22–25
   for the latter)
2. Ptolemy, *Harmonics* I.12–13, II.10–11, II.13–14 (trans. Jon Solomon)
3. Stefan Hagel, *Ancient Greek Music: A New Technical History* (2009)
4. Marcus Mota, "Meter and Representation: Creating Audio Files and Midi from Greek Tragedy Texts"
5. Tosca A. C. Lynch, "Arsis and Thesis in Ancient Rhythmics and Metrics: A New Approach," *CQ* 66.2 (2016)
6. Tosca A. C. Lynch, "Rhythmics," in *A Companion to Ancient Greek and Roman Music* (2020)
7. M. L. West, *Ancient Greek Music* (Oxford, 1992)
8. Martianus Capella, *De Nuptiis Philologiae et Mercurii* IX.974
9. Maria Gerolemou, "Some Thoughts on the Mechanical Features of Pantomime Dancers"
10. Choricius of Gaza, *L'Apologie des mimes*
11. Paola D'Alessio, "Aspetti della tradizione manoscritta di Coricio di Gaza"
12. Chrḗstos Terzḗs, "The Bacchius Fragment: A Critical Edition," *GRMS* 11 (2023)
13. Robert J. Penella (ed.), *Rhetorical Exercises from Late Antiquity* (review only, not the edition itself)
14. Armand D'Angour, "Rediscovering Ancient Greek Music" (OUP blog)
15. Marie-Hélène Garelli, "La Danse de Lucien"
16. Egert Pöhlmann, "Vitruvius... Resounding Vessels," *GRMS* 9 (2021)
17. Seneca, *Ad Lucilium Epistulae Morales*
18. Charles H. Cosgrove, *An Ancient Christian Hymn with Musical Notation* (P.Oxy. 1786)
19. Jennifer Porter, "Roman Mime and the Public Purse" (UBC MA thesis, 2025)
20. Fairbanks, Arthur. *A Study of the Greek Paean*. Appendix II ("Hymns
    Discovered at Delphi"), pp.111–139. Primary-source transcription of
    the Delphic Hymns' notation.
21. Christian Meyer (ed.), *Collectae glossae in De nuptiis Philologiae
    et Mercurii Martiani Capellae (Liber IX)* (HAL, 2013)
22. Lucian of Samosata, *On Dancing* (*Peri Orchēseōs*)
23. Strabo, *Geography* IX.3.10; Pollux, *Onomastikon* IV.84 — via
    Andrew Barker, *Greek Musical Writings*, vol. 1 (Cambridge, 1984)
24. Pseudo-Plutarch, *De Musica* — Weil, Henri, and Théodore Reinach
    (eds./trans.). *Plutarque: De la Musique.* Paris, 1900. Authorship
    disputed (see Modal Tonoi/ethos entry above); date range c. 1st–5th
    c. CE.
25. Aristotle, *Politics* VIII, 1341a–1342a31–33 — originally received
    via Mystrioti (trans. attributed there to Ernest Barker); also
    directly verified against the primary text.
26. Plato, *Republic* III, 398e–399a and 399c–d — originally received
    via Mystrioti (trans. attributed there to Paul Shorey) for
    398e–399a only; directly verified in full (both 398e–399a and
    399c–d) against the primary text — Jowett, Benjamin
    (1817–1893) and Lawton, William Cranston (1853–1941), trans.
27. G. Mystrioti, "Pseudo-Plutarch's *De Musica*: The Moral and
    Pedagogical Importance of Music and Neoplatonism's Critical Attitude
    Against Its Progress" (National and Kapodistrian University of
    Athens) — vehicle for entries 26–27 above; also names Heraclides of
    Pontos (*On Music* III, ap. Athenaeus, *Deipnosophistae* 14.264c–d)
    as an early Classical/Academic source Pseudo-Plutarch draws on.
28. M. L. West, *Introduction to Greek Metre* (Oxford: Clarendon Press,
    1987), pp.33–35 — Sapphic/Alcaic Aeolic stanza structure.
29. Aristides Quintilianus, *De Musica* — available for contextual and
    terminological corroboration; not used to supply a tetrachord
    division in the current implementation.
30. Nicomachus, *Arithmetic* — available for Pythagorean numerical
    background; not used to supply a tetrachord division or runtime
    pitch rule.

---

## Creative / algorithmic features — not sourced by design

These rhythm-model variants are explicitly creative DSP simulations,
not claimed reconstructions of ancient practice. Recorded here because
this status is itself paper-relevant provenance information (what
*isn't* claimed as historical), not because they need further sourcing
work.

- **`aristoxenianTempo` tempo modifier** (1.2x/0.95x, applied on top
  of the cited 2:1 Aristoxenian ratio) — the specific 1.2x/0.95x
  multiplier remains unsourced, `SPECULATIVE` in code. **The general
  concept is not invented wholesale, though**: West, *Ancient Greek
  Music*, pp.153–154, confirms tempo (*agoge*)
  as a real, named ancient concept, bound up with rhythm choice —
  "certain rhythms being perceived as intrinsically faster or slower
  than others," with dochmiac specifically "used only when the tone
  was urgent or impassioned" and trochaic having "a running or
  tripping effect" (citing Aristid. Quint. pp.82–84, Aristox. *Harm.*
  2.34). West is explicit the ancients left no metronome markings, so
  no numeric multiplier is recoverable from this — the qualitative
  concept is sourced, the specific 1.2x/0.95x number is this project's
  own choice, same distinction as `ethosIntervals` and other
  interpretive-shade entries above.
- **`heraclitean_pulse` rhythmModel** (`Math.sin(index * 0.7) * 0.15`
  variability formula) — algorithmic simulation of human pulse/micro-timing
- wave. Creative DSP feature, non-historical formula by design.
- **`euripidean_flow` rhythmModel, displayed as "Tragic dochmiac flow
  (interpretive)."** West, *Ancient Greek Music* (1992), pp.142–144,
  supports its qualitative basis: dochmiac is characteristic of tragedy,
  used in urgent or emotional contexts, and fluctuates with other
  measures and changing bar-length. The live
  `dochmiacModifiers = [0.95, 1.15, 0.85, 1.1, 1.0]` are this
  application's creative timing realization of that variability, not
  values transcribed from West, Euripides, or another ancient source.
  This is therefore a source-backed interpretation, not a reconstruction
  of a specific Euripidean performance.

---

## Appendix: Lynch cross-reference and implementation audit

**Sources audited.** Tosca A. C. Lynch, “Arsis and Thesis in Ancient
Rhythmics and Metrics: A New Approach,” *Classical Quarterly* 66.2
(2016), pp.491–513; and “Rhythmics,” in *A Companion to Ancient Greek
and Roman Music* (2020).

**Runtime basis.** The live generation route is POST /api/generate-midi
→ metricalAnalysis.processVerses() → metricalPatterns in
server/services/metrical-analysis.ts → midiGenerator.generate() →
createTracks() → createRhythmTrack(). The exact-symbol metricalPatterns
table supplies durationTablature; it is the runtime evidence for the
metrical shapes below. `computeFootStructure()` and its local
`footRatios` table in `midi-generator.ts` are not called on that path.

| Lynch claim                                         | Current implementation status                                                                                                                                                                                   |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Rhythmical arsis/thesis is pitch-based, not dynamic | Implemented as a raised/lowered pitch contrast. Lynch supports the direction and mechanism, not the application’s approximately one-semitone magnitude.                                                         |
| Rhythmical rather than late metrical arsis/thesis   | The project deliberately uses the rhythmical sense; see “Thesis/Arsis marking.”                                                                                                                                 |
| Dactylic, iambic, and paeonic rhythmic genera       | The live long/short representation preserves their basic proportional shapes. In chronos_ratios, short = 1 and long = 2, including at foot boundaries. It does not construct a separate whole-foot timing plan. |
| Metrical epitrites                                  | Live as U---, -U--, --U-, and ---U; see “Rhythm: metrical epitrites.”                                                                                                                                           |
| Ionic a minore / a maiore                           | Live as UU-- / --UU; see “Rhythm: ionics.”                                                                                                                                                                      |
| Rhythmical Bacchius compounds                       | Live under standard metric names: U--U (antispast) and -UU- (choriamb). The named bacchius_rhythmical_1/2 copies are not runtime evidence.                                                                      |
| Selected dochmiac evidence                          | The codebase handles the standard dochmiac foot (U--U-) and evaluates its variant metrical shape (U---U) through the primary duration route as legal quantitative structures.                                   |
| “Larger” / “greater” feet                           | Not separately representable in the shape-only model: they differ in absolute magnitude, not relative shape. This is a structural boundary, not an omitted table entry.                                         |
| Other standard feet absent from Lynch’s discussion  | Tribrach, molossus, individual paeons, choriamb, amphibrach, cretic, and proceleusmatic are not validated by Lynch. Any future source check requires an appropriate metrical authority, as recorded in TODO.md. |

**Audit conclusion.** No additional Lynch-specific implementation gap was
found. The remaining limits are explicit: whole-foot timing normalization
is an open design task, larger feet require an absolute-magnitude model,
and a source-specific basis for U---U would be needed before that shape
can be presented as source-verified.
