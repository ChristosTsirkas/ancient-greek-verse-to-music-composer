# Ancient Greek Verse to MIDI Composer

**Hear Ancient Greek verse as structured musical time.**

Ancient Greek Verse to MIDI Composer is an academic listening tool that turns
Greek verse and metrical patterns into downloadable MIDI compositions. It
brings metrical analysis, three synchronized musical layers, ancient-style
instrument mappings, and configurable pitch and rhythm models into one
accessible web application.

Use it to compare metres, test how long and short syllables shape a rhythm,
and create repeatable listening examples for teaching, study, or research.
Every experimental choice is labeled as such: this is a transparent
interpretative tool, not a claim to reproduce an ancient performance exactly.

The project attempts to document the distinction between attested ancient evidence and its own
audible, experimental interpretations.

## Built for students and academics

The application has two complementary goals: it gives students an approachable way to hear
metrical and musical ideas, while giving academics enough detail to assess what the software
does -- and what the evidence does not establish.

| Audience  | What the project provides                                                         | Why it matters                                                                                                                   |
|-----------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Students  | Clear controls, in-context explanations, and conservative defaults                | Makes unfamiliar metrical and musical concepts practical to explore without presenting an interpretation as settled fact.        |
| Students  | Predictable, downloadable MIDI and browser listening previews                     | Supports repeated listening, comparison, and classroom use with ordinary modern tools.                                           |
| Students  | Explicit labels for experimental and interpretative options                       | Helps distinguish a learning-oriented realization from an ancient score or recording.                                            |
| Academics | A granular [provenance record](docs/PROVENANCE.md)                                | Lets readers trace implementation choices to ancient evidence, modern scholarship, or an explicitly identified project decision. |
| Academics | Interpretative labels and stated historical limits                                | Makes claims proportionate to the available evidence rather than implying an unattested reconstruction.                          |
| Academics | A public [TODO record](docs/TODO.md), including dead-code and deferred-work notes | Makes unfinished, inactive, and unresolved parts of the software visible for critical review.                                    |

## Live demo

A working demo is available at
[ancient-greek-music-composer.duckdns.org](https://ancient-greek-music-composer.duckdns.org/).

## Features

### Core functionality

- **Turn verse into sound** with MIDI generation, downloads, and in-browser
  preview playback.
- **Explore metre audibly** with synchronized rhythm, accent, and vocal-guide
  tracks.
- **Compare ancient-style timbres** through clearly identified General MIDI
  practical stand-ins.
- **Experiment with pitch approaches** including Pythagorean fifths,
  Ptolemaic tonoi, and separately labeled interpretative ethos.

### Interpretative tools

- **Rhythm models** for Aristoxenian chronos, Delphic paeonic patterns,
  Sapphic/Alcaic line timing, Nomos form, and tragic dochmiac flow
- **Genera emulations** for diatonic, chromatic, and enharmonic listening
  experiments
- **Antiochene scenic features** and pantomime accompaniment

## Documentation

- [AI assistance and authorship disclosure](AI_DISCLOSURE.md) — how AI and
  human direction contributed, plus the project's research limitations.
- [How to cite](CITATION.cff) — GitHub-readable citation metadata and the
  recommended AI-assisted, interpretative-software citation.
- [Installation and Google OAuth setup](docs/INSTALLATION.md) — local
  development, Debian/Ubuntu deployment, database, OAuth, and Nginx steps.
- [Provenance and source limits](docs/PROVENANCE.md) — the evidence behind
  implementation choices and clear boundaries on historical claims; all based
  on ancient, primary sources and on modern scholarship on ancient Greek
  musical theory, including scholarly reconstructions where ancient evidence
  is incomplete.
- [Technical specification](docs/TECHNICAL_SPECIFICATION.md) — architecture,
  data flow, MIDI generation, and option behavior.
- [Project TODO](docs/TODO.md) — active design work, deferred research, and
  resolved implementation records.
- [License](LICENSE.md) — PolyForm Shield 1.0.0 for original code, with an
  additional unrestricted academic-use permission; future paper material is
  CC BY 4.0.

## Usage

1. Enter Greek verse text with corresponding metrical patterns.
2. Select an instrument, tempo, and musical mode.
3. Configure pitch and rhythm options as needed.
4. Generate and download the MIDI file.

## License

See [LICENSE.md](LICENSE.md) for the code license, academic-use permission,
and the planned paper license.

## Citation

If you cite this project, identify it as AI-assisted, interpretative
research software and note that it is unreviewed. Suggested form:

> Tsirkas, C. (2026). *Ancient Greek Verse to MIDI Composer*.
> AI-assisted interpretative research software, unreviewed.
> https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer

Machine-readable citation metadata is available in
[CITATION.cff](CITATION.cff).
