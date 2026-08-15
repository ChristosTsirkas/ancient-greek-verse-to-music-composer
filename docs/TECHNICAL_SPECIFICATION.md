# Ancient Greek Verse to MIDI Composer — Technical Specification

## Purpose and documentation boundaries

The application accepts Ancient Greek verse and metrical information and
generates a Standard MIDI File for comparative listening and teaching. It
does not claim to reconstruct a definitive ancient performance.

This document describes current software behavior. Historical evidence and
the limits of each claim belong in [PROVENANCE.md](PROVENANCE.md); unresolved
research and engineering work belongs in [TODO.md](TODO.md).

## User workflow

1. Enter verses, metrical patterns, and optional arsis/thesis markings.
2. Select instrument, tempo, musical mode, and optional MIDI layers.
3. Use **Interpretative Options** for rhythm, pitch, and scenic settings.
4. Generate and download a `.mid` file; stored history and GDPR exports are
   available when persistence is configured.

The client and server share Zod request schemas in `shared/schema.ts`.

The verse editor accepts one or more verse cards. Each card requires Greek
text and a metrical pattern; users can add or remove cards. A separate
request name is optional and is used as the label in download history. The
metrical-reference panel is a UI reference aid.

## Primary generation settings

The main settings panel provides 15 instrument identifiers: wind instruments
(`aulos`, `syrinx`, `salpinx`); strings (`lyra`, `kithara`, `phorminx`,
`pandura`); percussion (`tympanon`, `krotala`, `kymbala`, `sistrum`); and
theatrical/percussive effects (`rhoptron`, `keraunoskopion`,
`hand_clap_light`, `hand_clap_strong`). These are General MIDI practical
stand-ins, not sampled reconstructions of ancient instruments.

`rhoptron` and `keraunoskopion` are offered as theatrical/effect labels in
the UI; their naming and historical status are not equivalent to the
well-attested core instrument claims. That uncertainty is recorded in
`PROVENANCE.md` and TODO rather than hidden by the MIDI mapping.

The request schema accepts tempo from 60 to 200 BPM, eight named modal selections
(`dorian`, `phrygian`, `lydian`, `mixolydian`, `aeolian`, `hypolydian`,
`hypophrygian`, and `hypodorian`), and switches for the metronome, accent,
and vocal-guide tracks. In the current public interface, the tempo and tuning
controls are hidden; the range remains available to validated API requests,
not as a visible browser control.

Choosing an **interpretive ethos** updates the named mode and automatically
enables melody. The separate **Allow melody** switch can also enable melodic
variation without changing the selected pitch framework. Ptolemaic tonos does
not require melody mode. The helper-overlay area offers metronome, accent,
and vocal-guide tracks; the UI warns that these overlays do not work with
arsis/thesis patterns. MIDI is the working output format. A hidden WAV option
remains marked “Coming Soon” and is not a supported export path.

The MusicXML download is an application timing score for the primary track.
It preserves the generated integer tick durations at 480 divisions per quarter;
conventional note types and dots are emitted only where an exact written value
exists. Arbitrary timing produced by application microtiming remains a
duration value rather than a claim of complete conventional engraving.

The tuning selectors are currently hidden, so the live interface fixes
`pythagorean`; `equal_temperament` remains an internal schema fallback. The
tempo slider is inside the same hidden control block. Pythagorean tuning is a
pitch framework implemented through pitch bend, while note duration continues
to be calculated by the selected rhythm path.

### Modal pitch material

The generator's named mode arrays are semitone offsets from the selected
base note:

| Mode         | Live offsets             |
|--------------|--------------------------|
| Dorian       | `[0, 1, 3, 5, 7, 9, 10]` |
| Phrygian     | `[0, 1, 3, 5, 7, 8, 10]` |
| Lydian       | `[0, 2, 4, 6, 7, 9, 11]` |
| Mixolydian   | `[0, 2, 4, 5, 7, 9, 10]` |
| Aeolian      | `[0, 2, 3, 5, 7, 8, 10]` |
| Hypolydian   | `[0, 2, 4, 5, 7, 8, 10]` |
| Hypophrygian | `[0, 1, 3, 5, 7, 8, 10]` |
| Hypodorian   | `[0, 2, 3, 5, 7, 8, 10]` |

Dorian's lower tetrachord is the source-checked tense-diatonic
semitone-tone-tone form. The other seven arrays remain unaudited against the
same detailed question; their availability in the UI is not a claim that
their exact interval arrays have all received equivalent source validation.
The qualitative ethos names are handled separately from Ptolemy's technical
tonoi, as described below.

### Arsis/thesis mapper

The verse editor can enable a choreographic arsis/thesis pattern. Every
syllable must be explicitly marked A or T before the pattern is passed to
generation. With the current default, arsis receives a small upward pitch
contrast and thesis a small downward contrast, without a velocity contrast.

Two mutually constrained alternatives are exposed:

- **Disable arsis/thesis pitch marking entirely:** preserves the selected rhythm and melody behavior across the track,
  without applying the directional pitch-contrast modifications.

## Interpretative Options

### Rhythm models

`experimental.rhythmModel` contains eight selectable values:

| UI label                                 | Identifier          | Live behaviour                                                                                                                    |
|------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Standard metrical analysis               | `standard`          | Normal duration-tablature path.                                                                                                   |
| Aristoxenian Chronos ratios (foot-based) | `chronos_ratios`    | Long = 2 and short = 1 proportional units, preserved at foot boundaries.                                                          |
| Variable flow (Heraclitean Pulse)        | `heraclitean_pulse` | Sine-based ±15% timing variation; explicitly creative.                                                                            |
| Tragic dochmiac flow                     | `euripidean_flow`   | Application-defined five-value cyclic duration modifier.                                                                          |
| Delphic paeanic system                   | `delphic_paean`     | Alternates first and fourth paeon shapes `[2,1,1,1]` and `[1,1,1,2]`.                                                             |
| Sapphic aeolic meters                    | `sapphic_lyric`     | Repeating 6/8, 6/8, 10/8 verse positions at the shared MIDI reference unit; the chronos base-unit control does not compress them. |
| Nomos performance structure              | `nomos_apollonian`  | Five programmatic duration sections per verse.                                                                                    |
| Antiochene scenic music                  | `antiochene_scenic` | Standard proportional timing plus optional scenic additions.                                                                      |

Selecting any rhythm model sets the shared Pythagorean-fifths plus
diatonic listening baseline. This is a historically informed convenience
default, not a claim that every represented repertory used that exact
tuning-plus-genus pairing. Users may change it afterward.

`chronos_ratios` retains an open foot-normalization decision; the unused
legacy foot-timing cluster must not be enabled as a quick fix. The current
Delphic jitter/pause, Heraclitean formula, tragic modifiers, and Nomos
numeric section ratios are application interpretations. Exact supporting
sources and limits are recorded in `PROVENANCE.md`.

### Pitch approach

The pitch selector offers two mutually exclusive approaches. The default is
the source-checked Ptolemaic Dorian tonos; interpretive ethos remains an
explicit alternative:

- **Interpretive ethos:** named qualitative ethos represented by the
  application's two-note dyad. The dyad is interpretative, not an ancient
  numerical prescription.
- **Ptolemaic tonos:** the default framework, with one of seven transposition positions. The
  backend uses Dorian pitch material, then applies a semitone shift and
  residual-cent pitch bend; it does not use the ethos dyad. Choosing
  interpretive ethos sets the underlying `tonos` value to `none`; `none` is
  not a separate item in the Ptolemaic-position dropdown.

The UI does not offer a tonos-plus-ethos pairing.

### Tuning and genus

`tuningSystem` has `equal_temperament` and `pythagorean` schema values. The
current interface fixes the latter; equal temperament remains an internal
fallback. Pythagorean tuning uses stacked 3:2 fifth relations for the
fixed/standing pitch framework and is applied as MIDI pitch bend to
non-percussion notes. The implementation smooths the Pythagorean comma across
the completed fifth cycle for practical MIDI use; it is therefore a tempered
approximation rather than a historical one-wolf-interval realization.

The source ratios exposed in the main UI explanation include the 3:2 fifth,
4:3 fourth, and 9:8 major second. They describe the pitch framework, not a
tempo system.

The selectable genera are `diatonic`, `diatonic_soft`, `chromatic`,
`chromatic_soft`, `chromatic_hemiolic`, `enharmonic`, and
`enharmonic_symmetric`. They are deterministic pitch emulations on
generated notes, not a full runtime tetrachord-reconstruction engine.

A full Archytan tetrachord reconstruction is intentionally deferred
(TODO.md, Deferred item 3). If implemented, it will be an optional,
interpretative pitch framework that replaces the current genus-emulation
and additive Pythagorean-correction paths for its pitch pool. It will
offer only Archytan diatonic/chromatic/enharmonic divisions, construct
fixed endpoint plus moveable inner notes, and route all live
note-selection paths through that pool. Rhythm, instrument,
accompaniment, and export controls will remain independent. It will be
mutually exclusive with qualitative ethos; a Ptolemaic tonos may only
transpose the completed framework. Exact source basis and limits are in
PROVENANCE.md, “Genera: deferred Archytan tetrachord reconstruction.”

The plain options correspond to the following live behavior:

- **Diatonic:** uses the selected modal pitch material without an additional
  genus bend.
- **Chromatic:** adds a deterministic ±100-cent adjustment on accented
  syllables.
- **Enharmonic:** adds Archytas-based ±63/±49-cent adjustments on accented
  syllables.
- **Soft/hemiolic/symmetric shades:** apply their documented 50-, 67-, 75-,
  or symmetric-50-cent accent adjustments. They are labeled “modern
  realization” in the UI because the engine is not constructing complete
  tetrachords.

Pythagorean plus enharmonic choices remain available for exploration but
display an experimental-synthesis warning. When a verse has arsis/thesis
markings, the live rhythm track forces the enharmonic treatment for its
quarter-tone pitch component. A separate control can suppress the default
pitch distinction.

### Antiochene features

Antiphonal response and pantomime options can add MIDI tracks. Some
The selected rhythmic-cell cycle is checked against the parsed metrical
foot; it can contribute application-defined pitch/velocity modifiers but
does not change the foot's scanned timing. Individual foot shapes have their
own sources. The selected three-foot order and its MIDI modifiers are
interpretative and are not Antiochene reconstructions.

When `antiochene_scenic` is selected, the visible rhythmic-cell matrices are
Standard, Dochmiac–Paeon–Cretic, and Paeon–Cretic–Iamb. The panel offers
melismatic ornamentation, antiphonal response sections, and a pantomime
gesture layer. The schema retains the auto ethos–instrument mapping setting,
but its control is hidden from the UI. Melismatic
ornamentation is mutually exclusive with the other Antiochene additions;
antiphonal response and pantomime can be selected together. The named
historical contexts do not validate every numeric or algorithmic detail;
their individual limits are recorded in `PROVENANCE.md` and `TODO.md`.
The request schema additionally retains `tragic_meters` and `comic_meters`
cell identifiers, but the current UI does not expose them and the live scenic
cell table has no corresponding entries. If supplied through the API, they
therefore resolve to standard cell behavior rather than activating a separate
tragic or comic algorithm.

## Generation pipeline

### Mota three-layer organization

The generated core reflects Marcus Mota's three-layer methodology from
“Meter and Representation: Creating Audio Files and Midi from Greek
Tragedy”; its full bibliographic record and implementation limits are in
`PROVENANCE.md`:

1. **Duration tablature:** verse long/short data becomes note duration.
2. **Accent tablature:** metrical/accent information produces a separate
   optional accent-emphasis track.
3. **Vocal guide:** an optional reference track makes the syllabic and
   phrasing structure audible.

The rhythm/melody track is the primary audible output. The other two layers
are independently switchable helper tracks, rather than requirements for a
valid MIDI file.

`POST /api/generate-midi` validates a `MidiGenerationRequest`, processes
verses through `MetricalAnalysisService`, then invokes
`MidiGeneratorService.generate()`. The generator creates a binary Standard
MIDI File Format 1 buffer with 480 ticks per quarter note.

The primary rhythm/melody track is always produced. Optional tracks are
accent tablature, vocal guide, metronome, antiphonal response, and
pantomime gestures. The last two are Antiochene additions.

For a generated event, Ptolemaic-tonos, Pythagorean, and genus-cent offsets
are combined into one MIDI pitch-bend event, avoiding same-tick collisions.
Percussion uses MIDI channel 10; melodic material uses the normal melodic
channel.

Live note lengths are calculated by `calculateNoteLength()`.

## Application architecture

| Layer          | Current implementation                                                                                                                                                        |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Client         | React 18, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query, and Wouter.                                                                                                  |
| Server         | Node.js, Express, TypeScript, Zod validation, and custom binary MIDI assembly.                                                                                                |
| Persistence    | Drizzle schemas for users, sessions, MIDI files, downloads, GDPR consent, and usage. `DatabaseStorage` is used with `DATABASE_URL`; otherwise the app uses in-memory storage. |
| Authentication | Optional Google OAuth through Passport. Missing credentials disable Google login rather than preventing startup.                                                              |
| Privacy        | Routes provide GDPR export for stored MIDI/download and user data.                                                                                                            |

Relevant routes include generation, download/history, authentication,
usage-status, and GDPR export endpoints. The home page composes the verse
input, settings, interpretative panel, status, and history views.

## Build and deployment

- `npm run dev` starts the TypeScript Express/Vite development server.
- `npm run build` builds the Vite client and bundles the server with esbuild.
- `npm start` runs the built server.
- `npm run check` performs TypeScript checking.
- `npm run db:push` applies the Drizzle schema.

See [INSTALLATION.md](INSTALLATION.md) for PostgreSQL, Google OAuth,
Debian/Ubuntu, and Nginx configuration.
