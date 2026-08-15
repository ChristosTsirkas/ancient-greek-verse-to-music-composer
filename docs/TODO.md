# TODO

## Deferred — will be pursued on due time

### 1. Foot-level Chronos realization

**Status: deliberately deferred; the current implementation is already
foot-aware.** User-supplied metrical patterns are parsed as discrete feet;
the live route traverses those feet, applies matching dramatic-metre modifiers
only to the relevant parsed foot, and maintains the documented inter-foot
handling. Within `chronos_ratios`, however, `calculateNoteLength()` realizes
the Aristoxenian short = 1 and long = 2 relation syllable by syllable. It does
not construct a separate whole-foot timing plan for the internal organization
or position of a foot.

**Why this is a substantial methodological task, not a correction of the
present sound.** The current output already makes the source-supported 2:1
quantitative relation audible. A full foot-level realization would be a
methodological and architectural extension, not a claim that the current
Chronos sound signature is defective or historically invalid. The surviving
evidence does not supply a complete numerical performance rule for every foot;
any new implementation would therefore have to distinguish source-governed
constraints from interpretative internal timing.

**Required method before implementation.**

1. Define, source by source, which foot-level relations are supported and
   which internal timing choices remain interpretative. Do not infer a
   universal ancient tempo or a complete performance score from Aristoxenus'
   proportional principles.
2. Design an explicit whole-foot duration plan that preserves the current
   long/short relation unless a deliberate, documented listening comparison
   justifies a change.
3. Trace effects on rhythm/melody, accent, metronome, vocal-guide, and scenic
   tracks. A whole-foot plan may change the current Chronos listening
   signature and must not silently break synchronization.
4. Add focused regression tests for matching feet, aggregate duration totals,
   boundaries, and cross-track synchronization; compare controlled listening
   examples with the current syllable-level realization.

See `docs/PROVENANCE.md`, “Rhythm: Aristoxenian genus ratios,” and
`docs/TECHNICAL_SPECIFICATION.md`, “Duration calculation and rhythm models.”

### 2. Antiochene scenic performance: direct-source and reconstruction pass

**Status: deliberately deferred; no implementation work follows from this
entry without a new decision.** The present audit has enough evidence to
describe the Antiochene options as historically informed,
interpretative listening models. It does not have a recoverable
Antiochene score, choreography, timing grid, tonal pairing, or
instrumentation map.

**What is now supportable.** Libanius and the modern pantomime research
on hand support Antiochene theater and pantomime as a world of gesture,
pose, chorus, instrumental accompaniment, pulse/time-keeping, and
coordination of movement and music. The general ancient evidence also
supports antiphonal dramatic exchange and melismatic writing. This does
not make the application's generated response patterns, ornamental
pitches, MIDI durations, velocities, gesture-to-note mappings, or
Ptolemaic-tonos pairing historical reconstructions. Full committed
evidence limits are in `docs/PROVENANCE.md`.

**Research still needed.** Obtain and read, passage by passage, the
following works before strengthening any historical claim:

- Ismene Lada-Richards, *Silent Eloquence: Lucian and Pantomime
  Dancing* (2007) — gesture as rhetorical/affective system, not assumed
  to be choreographic notation.
- Ruth Webb, *Demons and Dancers: Performance in Late Antiquity* (2008)
  — late-antique performance culture and the relation of delivery and
  dance.
- Marie-Helene Garelli, *Danser le mythe: la pantomime et sa reception
  dans la culture antique* (2007) — check for distinct evidence not
  represented in the available English-language scholarship.
**Questions and safe method for a future implementation pass.**

1. Whether any direct late-antique evidence supports antiphonal
   *structure* in Antioch, rather than the general existence of chorus,
   song, and theatrical response. Do not alter the response algorithm
   unless direct support is found; otherwise keep or remove it as an
   explicitly interpretative option.
2. Whether a source supports any particular relationship between gesture,
   character/affect, metre, tempo, instrument, or melodic contour.
3. Whether the scabellum should become a user-selectable Antiochene
   percussion/timing option, and how to present it without pretending
   that a General MIDI patch reproduces the instrument. First establish
   the exact source citation, then add it only as an Antiochene-scoped
   option with a modern-timbre warning; do not add it to the general
   instrument selector.
4. Whether any source connects Ptolemaic tonos theory to Antiochene
   scenic performance. Until then, keep this combination explicitly
   exploratory.
5. Whether the application should retain, revise, or remove the
   generated antiphonal and ornament algorithms after their unsourced
   numerical rules have been fully audited. Preserve the current wording
   unless a source supplies a rule; if no rule is found, label the values
   as application design or remove the feature rather than inventing a
   citation.
6. Listen again to `dochmiac_paeon_cretic` and `paeon_cretic_iamb` with
   controlled examples, including the reported high final note. If a
   defect is reproduced, isolate the responsible pitch/velocity branch,
   add a regression test, and change only that branch.
7. Determine whether any late-antique Antiochene source connects dramatic
   polymetry or these particular feet with local performance. West,
   *Introduction to Greek Metre* (1987), pp.55-57, 66-67, is sufficient
   present support for an explicitly interpretative dramatic-metre modifier
   cycle, but does not establish Antiochene use or either exact sequence.
8. Reconsider the UI placement of the dramatic-metre modifier cycles. They
   are currently available only inside the Antiochene panel, although their
   present support is general dramatic polymetry rather than Antiochene
   practice. Do not add a general option yet; first decide whether a future
   non-Antiochene interpretative section would make the relationship clearer.

**Implementation boundary until this task is reopened.** Retain the
features only with careful interpretative wording; do not add historical
claims, citations, numeric rules, or additional options based on the
unavailable works. The separately identified duplicate-event melisma
defect is an engineering fix, not a research answer, and may be handled
independently when approved.

### 3. Genus emulation versus full tetrachord reconstruction
The live genus options are currently **sourced emulations**, adequate for the application's present educational
listening purpose: chromatic, enharmonic, and reconstructed shade values are applied as documented MIDI pitch
adjustments to generated notes. Their source values are already cited in code and `PROVENANCE.md` — Archytas' enharmonic
ratios via Ptolemy, *Harmonics* I.13; Aristoxenian and soft/hemiolic shade values via Hagel, *Ancient Greek Music*
(2009), p.153; and the Dorian diatonic baseline via Hagel/Weil–Reinach.

They are **not** a full runtime tetrachord engine that lays out fixed and moveable notes across each genus before
melodic generation. That is a future architectural reconstruction task, not a defect in the current cited emulation. Do
not present the current output as a complete tetrachord reconstruction; revisit only if the project needs that more
literal theoretical model.

**Status: deliberately deferred.** This is a sound-changing architectural replacement, not a checkbox-sized enhancement.
It requires dedicated listening tests and must not be attempted as a quick modification of the current accent-pitch-bend
branches.

**Research basis checked for a future implementation:**

- Aristoxenus, *Harmonic Elements*, as discussed in Marchetti's *Aristoxenus, Elements of Rhythm* dissertation,
  pp.22–25: a tetrachord has fixed outer notes spanning a fourth and two moveable inner notes; their positions establish
  enharmonic, chromatic, and diatonic genera.
- Ptolemy, *Harmonics* I.12, trans. Solomon, pp.40–42: independently defines the same fixed/moveable architecture and
  records Aristoxenian divisions, including the six unmixed genera/shades.
- Ptolemy, *Harmonics* I.13, trans. Solomon, pp.43–44: records Archytas' ratio-based divisions. The currently used
  enharmonic 28:27 × 36:35 × 5:4 is only one such division, not yet a tetrachord engine.
- Hagel, *Ancient Greek Music* (2009), pp.34–35: explains the fixed tetrachordal framework, genus-defining inner notes,
  and the historical variety of shades; his p.153 table remains the basis for the present emulations.
- Aristides Quintilianus, *De Musica*, is available for contextual and terminological corroboration. Nicomachus'
  *Arithmetic* is available for Pythagorean numerical background, but neither has yet supplied a specific engine rule
  and neither may be used to fill a missing ratio.

**Approved future architecture — do not broaden it without a new decision.** Retain the existing genus dropdown as the
default current genus emulation. Add a separate optional pitch-framework control:

Use Archytan tetrachord reconstruction (interpretative).

When active, it must replace—not add to—the current genus pitch-bend emulation and Pythagorean-fifths correction for the
generated pitch pool. It must:

1. expose only Archytan diatonic, chromatic, and enharmonic divisions; hide or disable Aristoxenian
   soft/hemiolic/symmetric shade choices;
2. construct four-note tetrachords from the selected Archytan ratios, with fixed endpoints and moveable inner notes;
3. route every live note-selection path, melody and non-melody, through the resulting pitch pool;
4. preserve non-pitch controls: verse input, metre, rhythm models, tempo, instruments, accompaniment, and export;
5. keep qualitative ethos mutually exclusive, because it currently supplies an interpretative two-note pitch choice
   rather than a tetrachordal framework;
6. allow a Ptolemaic tonos only as a transposition of the completed tetrachord framework, with UI wording that calls the
   combination a theoretical model rather than an attested repertory pairing;
7. decide and test how arsis/thesis pitch contour behaves at the reconstructed-pool boundary rather than silently
   emitting an unaccounted pitch outside it.

The UI must call this an **Archytan tetrachord reconstruction (interpretative)**, never “Archytas' actual tetrachords.”
Ptolemy reports the ratios, but software register, tetrachord concatenation, and generated-note selection remain this
project's interpretative decisions.

### 4. Dochmiac foot resolution engine: remaining variants

West, *Ancient Greek Music*, pp.142–144, supplies the descriptive
evidence. The best-attested first-long resolution is already implemented
as `metricalPatterns["UUU-U-"]` alongside the existing shapes.

**Reason for deferral.** The remaining irrational-long substitutions
need non-integer duration support. West's fragmentation patterns
(reverse-order 5+3, standalone paeon repetition, and
three-group-prefixed-to-iambic) describe particular passages but supply
no generation rule or frequency model. Implementing them would be a new
interpretative design requiring separate listening tests.

### 5. Two-note ethos scale selection

`createRhythmTrack()` deliberately preserves its two-note `ethosIntervals` dyad for all non-percussion output, including
Pythagorean tuning, melody mode, and non-Dorian tonoi. Plato, *Republic* III.398e–399a; Aristotle, *Politics*
VIII.1340b, 1341a18–20, 1342a31–33; and Pseudo-Plutarch, *De Musica*
148, 153, 164–165 support qualitative modal ethos only, not a numeric melodic range or a larger default note pool. The
two-note behavior is retained as this project's conservative, explicitly speculative simplification. Any future
expansion requires a sourced design and comparative listening tests.

### 6. Dactylo-epitrite as a combination principle
M. L. West, *Ancient Greek Music* (Oxford: Clarendon Press, 1992), pp.151–152, establishes dactylo-epitrite as a historically significant
practice combining dactylic-shaped and trochaic units, including a specific resolution preference. This is distinct from
the implemented single metrical-epitrite shape. The source does not supply a complete generative algorithm or frequency
model for a selectable rhythm model, so implementation is deferred pending a dedicated design and sourcing pass.

### 7. Instrument timbre fidelity and remaining naming uncertainty

The app's General MIDI patches are modern practical stand-ins for ancient instruments; sources can establish an
instrument's historical attestation, but cannot identify an exact General MIDI sound. A more faithful result would
require a sample/WAV-based instrument engine, not further citation work alone. The specific historical status of
`pandura` as core Greek versus later Hellenistic/Roman-period, and the attestation of the term `keraunoskopion`, remain
uncertain and are flagged in code. Neither uncertainty blocks the current MIDI output, so this work is deferred rather
than treated as an active defect.

### 8. Aulos breath control

`addAulosBreathControl()`, `midi-generator.ts`
— was called live from `createRhythmTrack()` (whenever
`instrument === "aulos"`), but with a hardcoded `phraseLength=10`
argument against the function's own `>=12` guard — silently inert in practice, not a deliberate disable. Prior history
with this, recorded for context: breath control was tried before; didn't sound right, and delayed rhythms in a way that
conflicted with Mota's synchronized-track methodology (see `docs/PROVENANCE.md`, Methodology: three-layer architecture).
Fixed the argument mismatch (10→12, matching the function's own guard) so the function is internally consistent if ever
revisited, then disabled the call entirely (commented out, not deleted) — zero sound change, but no longer silently
broken either.

Whether ancient aulos players used circular/continuous breathing at all — bearing on whether any breath-pause mechanism
is even the right model — is genuinely contested, not settled. Confirmed independently (web search): Britannica's aulos
entry is notably cautious on this point; several more popular sources state it as settled fact without the same caution.
Not independently verified:
that M.L. West specifically makes a non-definitiveness claim on this in *Ancient Greek Music* — that attribution was
relayed via a secondary source, not checked against West's primary text directly. See `docs/PROVENANCE.md`, "Aulos
breath control (addAulosBreathControl)."

### 9. Rhythm-model preset pairing audit

All automatic rhythm-model presets now use the conservative Pythagorean-fifths plus diatonic listening baseline. That is
historically informed, and may be compatible with particular repertories, but is not asserted as a documented
tuning-plus-genus pairing for any model. The individual rhythmic bases are cited in `PROVENANCE.md`, "Rhythm-model
listening presets." Revisit only if direct evidence (scholarly or from an ancient source)
identifies a particular repertory's tuning and genus together; then add that option with its exact citation rather than
treating an application default as a reconstruction.

### 10. Heraclitean Pulse: product-position decision

`heraclitean_pulse` is a selectable rhythm model whose sine-wave timing
formula has no historical source. It is correctly disclosed in code and
provenance as a creative DSP feature. Decide whether to retain it with that
wording, relocate it to a clearly creative tools area, or remove it; do not
seek a post-hoc historical attribution.

### 11. Per-note MIDI microtonality and channel-allocation architecture

**Status: deliberately deferred; not a current playback bug.** The live
generator already separates its core rhythm track (MIDI channel 1), accent
percussion (channel 10), vocal guide (channel 9), and scenic tracks. The
accent track has no pitch-bend events, so the present helper layers do not
produce the alleged cross-track pitch-bend bleed.

MIDI pitch bend is nevertheless channel-wide. If the project later adds
overlapping melodic notes, sustained releases that must remain independent,
or genuinely polyphonic microtonal writing within one track, it will need an
explicit per-note/channel-allocation design. That work must specify channel
reservation, pitch-bend reset timing, exhaustion behavior, MIDI 2.0/MPE
compatibility if considered, and regression listening tests. Do not alter the
current monophonic comparative-listening path as a speculative "bug fix."

### 12. Named-mode/ethos path: duplicated pitch collections and long-term role

**Status: narrowed after implementation.** The Ptolemaic tonoi are now the
project's default source-checked technical pitch/transposition framework.
The live named
semitone arrays ("Interpretive ethos"), by contrast, make Phrygian and Hypophrygian byte-identical,
and likewise Aeolian and Hypodorian. This is disclosed in the paper and is a
real limitation for comparative listening: at the current melody-array level
those pair selections can sound the same.

Lydian, Mixolydian, and Hypolydian are distinct functioning arrays, but the
project currently lacks the source work needed to give them the same
mode-specific historical review already completed for Dorian. They are not
identified as bugs; their review belongs to this same deferred task.

The primary-framework decision is complete. The remaining task is to retain
the named-mode selector only as an explicitly interpretive ethos/listening
choice, redesign it from sources, or retire it from the primary pitch
workflow. Do not repair its duplicates by adding arbitrary root offsets.

If named modes are retained as more than interpretive ethos labels, a
historically defensible redesign must first decide whether each represents an
octave species, a tonos/transposition position, a modal center/range, or a
modern pedagogical approximation. It must then source the relation of the
*hypo-* names to the selected model, define the resulting register and final,
keep Ptolemaic-tonos behavior coherent, and add listening/regression tests.
The change is potentially audible and structural: it would change the pitch
center and/or register of affected selections, not merely rename duplicate
arrays.

## Implemented

- **Antiochene scenic cleanup: melisma repair, interpretative wording, and ethos-mapping UI removal.** The main
  rhythm track now emits exactly one base-note on/off pair for each syllable when melismatic ornamentation is enabled;
  `addAntiocheneOrnamentation()` adds ornaments only. Its two final cadence ornaments now also receive matching
  note-offs. This fixes the reported extra grouped material for `-UU -UU -UU -U` without changing the underlying
  foot-duration path. `tests/midi-generator.test.ts` asserts one primary pair and a matching release for every
  ornament. The Antiochene preset and its melisma, antiphonal, and pantomime controls are labeled
  **interpretative**; an explicit warning marks `antiochene_scenic` plus Ptolemaic tonos as exploratory. The auto
  ethos-instrument mapping control is hidden from the UI while its backend setting remains intact. The unused
  `addPtolemaicOrnamentation` and `addNicomacheanOrnamentation` helpers were separately removed after their zero
  callers were verified and their code archived in `REMOVED_FUNCTIONS.txt`. Remaining sourcing/reachability work is
  retained in Deferred TODO 2.

- **Downloadable score export.** Each generation produces a MusicXML 3.1
  application score for the primary musical track, covering every submitted
  verse and preserving its generated MIDI-note timing as notated durations,
  rests, voices, and measure ties. It is available beside the MIDI download
  with an in-context information control. It is not ancient notation or a
  scholarly transcription: MIDI pitch bends/microtonal adjustments and
  complex overlapping ornamentation may not engrave exactly. PDF engraving
  remains separate future work. MIDI and MusicXML files are stored under
  `downloads/midi` and `downloads/scores`, respectively.

- **In-browser MIDI listening.** After successful generation, a Play MIDI
  preview / Stop preview control plays the generated `.mid` through
  `midi-audio-player` and FluidR3 General MIDI SoundFont presets. It preserves
  the downloaded MIDI data, including its program changes, pitch bends, and
  controllers. The browser downloads and caches the needed presets from the
  WebAudioFonts endpoint; a future deployment may self-host a curated
  soundfont endpoint if CDN independence is required. The UI still identifies
  this as a preview and directs users to capable music software and
  high-quality sound libraries or soundfonts for higher-fidelity playback.

- **Chronos-ratios foot-boundary correction.** The live
  `calculateNoteLength()` path now retains short = 1 and long = 2 at
  each foot boundary; the former extra foot-final duration was removed.
  The separate 15ms inter-foot gap in the rhythm, accent, metronome, and
  vocal-guide tracks is unchanged; the pantomime track adds no separate
  inter-foot gap.
  Source: Aristoxenus, *Elementa
  Rhythmica* §§10, 16–20 (Marchetti trans., pp.68–71), which defines a
  foot through arsis/thesis markers measured as multiples of one primary
  time and supplies no additional boundary-duration unit. Listening
  preview remains available as validation, not an unresolved task.

- **Rhythm-model preset language and defaults.** Replaced unsupported automatic associations such as "ritual purity" and
  "emotional expression" with one conservative Pythagorean-fifths plus diatonic listening baseline. The UI now
  distinguishes a historically informed default from a reconstructed historical pairing; it also no longer claims that
  the Antiochene preset chooses Hypophrygian. Source support for each rhythm model, and the limit of what it
  establishes, is in `docs/PROVENANCE.md`, "Rhythm-model listening
  presets."

- **Tragic dochmiac flow (interpretive).** Renamed the user-visible
  `euripidean_flow` option so it no longer claims its five timing multipliers reconstruct Euripides. West, *Ancient
  Greek Music* (1992), pp.142–144, supports the qualitative design: dochmiac is tragic, urgent/emotional, and variable
  in bar-length and relation to other measures. The live `[0.95, 1.15, 0.85, 1.1, 1.0]` sequence remains an explicit
  application interpretation of that evidence, not a source transcription. See `docs/PROVENANCE.md`, "Creative /
  algorithmic features."

- **Sapphic/Alcaic 6/8–6/8–10/8 timing.** Replaced the unsupported
  `sapphicPattern = [1.2, 0.8, 1.0, 0.9, 1.1]` cycle with West's line-level model. West, *Ancient Greek Music* (1992),
  pp.148–150, Examples 5.11–5.15, analyses two regular 6/8 lines followed by a 10/8 line formed through impaction; it
  applies the same longer-third- line principle to Alcaic. When this explicit rhythm model is selected, consecutive
  input verses form repeating 6/8, 6/8, 10/8 groups; their supplied long/short values distribute the cited line totals.
  The generic within-line allocation is documented as an application mechanism, not an ancient reconstruction. See
  `docs/PROVENANCE.md`, "Rhythm: Sapphic and Alcaic stanza timing."

- **Ptolemaic tonoi separated from interpretive ethos.** The former hidden `experimental.tonos` control is now a
  visible transposition selector whose default is Dorian; selecting the interpretive-ethos approach sets the tonos to
  `none`. Ptolemy, *Harmonics* II.10–11 (Solomon trans.,
  pp.88–92), supplies the seven tonos names, order, and leimma/tone/tone/leimma/tone/tone sequence; the backend renders
  the 9:8 tone and 256:243 leimma as MIDI-note plus pitch-bend offsets around Dorian. The existing named selector is now
  explicitly an interpretive ethos layer, rather than an alleged tonos scale table. Ptolemy does not prescribe
  compatibility between those layers, so the UI makes them mutually exclusive rather than offering tonos-plus-ethos
  pairings. See `docs/PROVENANCE.md`, "Ptolemaic tonoi (optional transposition)."

- **Pythagorean plus Archytas enharmonic warning.** The application continues to permit `tuningSystem: "pythagorean"`
  with
  `genus: "enharmonic"` for experimental exploration. An in-context UI warning now states that the combination is not
  attested as ancient practice. Ptolemy, *Harmonics* I.13 and II.13–14, presents Archytas' division as a complete
  alternative system, not a component combined with Pythagorean fifth tuning. See `docs/PROVENANCE.md`, "Tuning:
  Pythagorean fifths."

- **`instruments` table — per-instrument citations added.** All 15 entries carry a citation comment confirming ancient
  attestation (documentation only — the GM patch numbers themselves are modern MIDI-standard choices, never
  ancient-sourceable, unchanged). Two items flagged rather than force-cited: `pandura`'s status as core ancient-Greek
  vs. later import is unverified; `keraunoskopion` could not be confirmed as an attested term at all — both carried
  forward as open items above rather than silently left as false citations.
- **Google OAuth callback URL — fixed.** `server/auth/google.ts`
  reads `GOOGLE_CALLBACK_URL` from the environment first, falling back to the same hardcoded defaults as before if
  unset — zero behavior change for existing deployments, no code edit needed for a new domain.
  `docs/GOOGLE_OAUTH_SETUP.md` updated to match (previously documented the old manual-edit-required process).

- **`applyAristoxenosTiming` — traced fully, confirmed functionally inert, marked `@deprecated`.** Live (called from
  `processVerses()`), but its `verse.pauseAfter` output is checked at 5 sites.
  `verse.pauseAfter` is checked at 5 sites but the actual application is commented out at every one — the same "5
  identical disabled lines" already documented in item 1, and this function is very likely their original source.
  Doesn't duplicate or conflict with the actually-audible Aristoxenian mechanism (`chronos_ratios`, which computes note
  duration directly) — the two are unrelated in effect, despite the name similarity. Marked `@deprecated` at its
  definition site; left in place, not removed, per dead-code policy.

- **`tetrachordPatterns` dead table — fixed, no new sources needed.**
  Checked by direct math against the already-known Hagel shade table:
  `enharmonic` was already correct; `diatonic` was tense diatonic's intervals in reverse order (already-known issue);
  `chromatic` matched no chromatic shade at all — it was identical to tense diatonic's correct pattern, as if the two
  entries had their shapes crossed. All three corrected to `[0,1,3,5]` (diatonic) and `[0,1,2,5]` (chromatic), matching
  Hagel p.153 exactly.

- **Hagel's four remaining tetrachord shades — implemented as selectable genus options.** `enharmonic_symmetric`
  (Aristoxenus' own, symmetric ±50¢), `chromatic_soft` (±67¢), `chromatic_hemiolic`
  (±75¢), `diatonic_soft` (±50¢, this project's own representation of a difference with no direct pyknon analogue). All
  four use cent values already sourced (Hagel 2009, p.153 — no new sources needed), applying the same
  deterministic-accent-nudge architecture already established for tonic chromatic, additively (existing
  `diatonic`/`chromatic`/`enharmonic` defaults unchanged). UI labels avoid the scholar's name per standing rule and
  carry a "(modern realization)" qualifier. See `docs/PROVENANCE.md`, "Genera: chromatic pyknon."

- **Pre-existing code, verified/cited/documented (or improved) — not built from scratch, but confirmed correct and
  properly sourced.** Full detail in each `PROVENANCE.md` section named below; this entry consolidates the list for
  visibility here too. Some of these have their own still-open TODOs for a *different* aspect of the same feature —
  noted where that applies, not a reason to leave the verified part off this list:
    - **Rhythm: Aristoxenian genus ratios** (dactylic 1:1, iambic 2:1, paeonic 3:2) — pre-existing, citation confirmed
      against *Elementa Rhythmica* II.30.
    - **Rhythm: metrical epitrites, ionics, rhythmical bacchius** — pre-existing, individually source-cited.
    - **Rhythm: "larger"/"greater" feet** — pre-existing, confirmed structurally out of scope for the shape-only matcher
      (not a bug).
    - **Rhythm: irrational khoreios** — pre-existing, cited.
    - **Genera: chromatic pyknon, enharmonic quarter-tones (Archytas)** — pre-existing; the Archytas citation was
      upgraded from secondhand to primary-source-verified (Ptolemy *Harmonics* I.13, directly consulted).
    - **Genera: diatonic (Dorian)** — the `[0,1,3,5]` fix itself predates already signed off, carried forward and
      documented here.
    - **`modes` table — aeolian, hypophrygian, and the other named tonoi/octave-species entries generally** — the
      *concept* (real ancient mode names, real octave-species structure) is correctly implemented; the specific
      `phrygian`≡`hypophrygian` and
      `aeolian`≡`hypodorian` duplication remains an unaudited mode-table issue; it is not a claim that the current
      generated output reconstructs those named pitch systems.
    - **Methodology: three-layer architecture** (Mota) — pre-existing, cited.
    - **Antiochene scenic listening model** — context and strict implementation limits are documented in
      `PROVENANCE.md`; generated numeric rules remain interpretative.
    - **Creative/algorithmic features, not sourced by design**
      (`heraclitean_pulse`, `euripidean_flow`, `aristoxenianTempo`) — pre-existing; correctly documented as
      intentionally non-historical DSP simulations, which is itself the correct, complete documentation for these (see
      `PROVENANCE.md`, "Creative / algorithmic features").

- **`footRatios` (dead table) — citation status resolved, no new sources needed.** Most entries
  already cited, just via cross-reference rather than inline: base dactylic/iambic/paeonic ratios, epitrites, ionics,
  dochmiac, `bacchius_rhythmical_1/2`,
  `orthios`/`trochaios_semantos`/`greater_spondee`/`paion_epibatos`
  (all Lynch 2020, own `PROVENANCE.md` sections). The genuine remainder (cretic, tribrach, molossus, individual paeons,
  choriamb, proceleusmatic) is already correctly documented as outside Lynch's scope (see `PROVENANCE.md`, “Appendix:
  Lynch cross-reference and implementation audit”), needing West's *Greek Metre* or Hephaestion (already tracked, item3)
  — not a new gap. Fixed a stale inline comment that still listed dochmiac as uncited after it got its own citation
later, and synced both duplicated copies of the table to match (per the project's duplicate-consistency policy).
- **Pythagorean+Archytas pitch-bend collision — fixed.** When enharmonic genus fires an Archytas quarter-tone pitch-bend
  and the Pythagorean correction also applies on the same syllable, both cents offsets are summed into a single combined
  `pitch_bend` event rather than pushed as two separate colliding events. See
  `server/services/midi-generator.ts`, the `archytasCents`/
  `pythagoreanCents` combination in `createRhythmTrack()`, and
  `docs/PROVENANCE.md`, Tuning: Pythagorean fifths.
- **Whether combining those two corrections is ancient practice — resolved (no), confirmed against Ptolemy's primary
  text.** *Harmonics*
  I.12–13 and II.13–14 lay out Archytas', Aristoxenus', Eratosthenes', Didymus', and Ptolemy's own tetrachord divisions
  as parallel, self-contained alternatives — never combined with each other. The combination is this project's own
  synthesis, documented as such, not an ancient practice. See `docs/PROVENANCE.md`, Tuning: Pythagorean fifths,
  "Author's decision" note.
- **Genus force-override (`effectiveGenus = "enharmonic"` whenever
  `arsisThesisPattern` is set) — sourcing check resolved, decision made.** Confirmed not sourced by Lynch (2016, 2020,
  both read in full): her papers never connect arsis/thesis to tuning genus, and
  "genus" turns out to be two unrelated ancient categories (tuning genus vs. rhythmic genus) sharing one English
  translation — the override conflates them. Decision: keep as-is, on aesthetic grounds, not a sourcing gap. See
  `docs/PROVENANCE.md`, Thesis/Arsis marking, "Author's decision" note.

- **`nomos_apollonian`** — qualitative five-section structure built from West's descriptive content
  (Peira/Katakeleusmos/Iambikon/ Spondeion/Katachoreusis), explicitly labeled interpretive since no source gives numeric
  ratios for any section. Iambikon's ratio tied to the already-sourced Aristoxenian iambic double ratio (2:1) rather
  than an invented number. See `docs/PROVENANCE.md`, "Rhythm:
  nomos_apollonian five-section structure (qualitative, interpretive)."
- **Lynch (2016, 2020): four remaining loose ends, all closed:**
    - Dochmiac shape — a second shape (`"U--U-"`) added alongside the original (`"U---U"`), built from Lynch's
      iamb+lame-paean breakdown, independently converging with West's paradigm. Additive, not a replacement — verse
      input is matched foot-by-foot against exact dictionary keys, so both coexist with no collision risk. See
      `docs/PROVENANCE.md`, "Rhythm: dochmiac (Lynch/West convergence),"
      and its “Appendix: Lynch cross-reference and implementation audit.”
    - The ~1-semitone pitch-contrast magnitude — permanently unsourced by design; Lynch gives direction only, never a
      size. Documented as this project's own choice, not oversold as sourced.
    - `paion_epibatos`'s `SPECULATIVE` flag — permanent, not a sourcing gap. Lynch flags the Aristides passage itself
      (37.10–12) as possibly textually corrupted; an unresolved manuscript crux, not something a different book fixes.
    - The Provenance appendix’s non-Lynch items (tribrach, molossus, paeon rotations, choriamb, amphibrach, cretic,
      proceleusmatic) — confirmed never in Lynch's scope to begin with. A different source (West's *Greek Metre* or
      Hephaestion) would be needed if these are ever wanted.
- **`ethosIntervals` two-note table** — checked against five independent qualitative sources (Pseudo-Plutarch, Plato,
  Aristotle, Aristides Quintilianus, Bacchius, Gaudentius); none contain a two-note dyad or any numeric encoding,
  confirmed as this project's own algorithmic synthesis, not a citation gap. See
  `docs/PROVENANCE.md`, "Modal Tonoi/ethos (ethosIntervals)."
- **`academic-footer.tsx` full audit** — all entries checked against
  `PROVENANCE.md` and the backend: Ptolemy, Aristides Quintilianus, Pseudo-Plutarch, Aristotle, Plato (already
  well-covered), plus Vitruvius, Apuleius, Seneca, Aristoxenus, Alypius, and the Delphic Hymns. Fixed: a wrong Vitruvius
  section citation, an over-precise Apuleius citation, an overclaimed Alypius/implementation link, and two
  cited-but-unreachable claims (hydraulis, scabellum — see Antiochene item above).
- **`chronos_ratios` rhythmModel gate — removed.** This model's actual Aristoxenian-sourced logic (2:1 long:short,
  *Elementa Rhythmica*
  II.30) was previously gated behind `verse.arsisThesisPattern` being set — with no arsis/thesis marking, it silently
  fell through to a generic proportional scale, indistinguishable in relative shape from the default "standard" model.
  Per standing instruction (Aristoxenian foot-time applies everywhere unless a specific case is shown not to be
  historically backed — no such case was documented for this gate), the gate is removed: the Aristoxenian logic always
  runs. Introduced in commit `383f347` ("v1.0 - AI pass #1", 2026-08-07), before this project's sourcing-and-provenance
  work began.
- **Non-melody-mode default sound — flat, exactly 2 notes, confirmed and traced, not a new regression.**
  `createRhythmTrack`, the fallback syllable-processing branch: in non-melody mode, `scale` is the 2-element
  `ethosIntervals` dyad, so pitch is mathematically guaranteed to alternate between exactly 2 notes by construction —
  same pre-existing behavior as the deferred `generatePythagoreanScale()`- discarded note-variety bug (item 0 above),
  confirmed by tracing the code. `chronos_ratios` only ever runs inside `calculateNoteLength()`
  (duration), with no code path into pitch selection, so the gate removal above is not the cause.
