# Disclosure: AI assistance and authorship

This disclosure explains how this research software was made, so that
readers can evaluate its claims and limitations appropriately.

## Summary

> Academic software artifact — AI-assisted, interpretative, and not peer-reviewed.

This project was developed through extended collaboration between Chris
Tsirkas and large-language-model assistants. AI systems have assisted with
code, documentation, source organization, implementation alternatives,
and research-oriented drafting.

Chris Tsirkas directed the project: he set its goals and scope, supplied
and selected the source material used in the project, made design and
historical-method decisions, coded parts of the application,tested audible output,
rejected unsupported claims, and decides what is released. He accepts responsibility
for the  release and for correcting it.

Chris Tsirkas is a software architect and playwright, and a classicist by
independent study rather than formal academic credential. His work on
Greek drama, metre, and performance motivates this software, but this
repository should not be treated as the work of a specialist musicologist
or as a substitute for peer-reviewed scholarship.

## What this means in practice

No part of this project has been peer-reviewed. Its source citations,
technical implementation, and interpretative decisions may contain errors
that a specialist in ancient Greek music, metrics, performance practice,
or music technology would identify.

The application distinguishes, where documented, among:

- attested ancient evidence;
- modern scholarly interpretation;
- the application's own algorithmic or audible interpretation; and
- experimental combinations that are available for exploration but are
  not presented as historically attested.

That distinction is central to the project, but it is not a guarantee
that every classification or implementation choice is correct. The
source-by-source record is in [docs/PROVENANCE.md](docs/PROVENANCE.md),
and unresolved limits are recorded in [docs/TODO.md](docs/TODO.md).

## What the application does not claim

It does not reconstruct a recoverable, definitive ancient performance of
any Greek text. Ancient musical evidence is fragmentary, and several
features in the application deliberately convert qualitative or partial
evidence into an audible model. Those features are useful for teaching,
comparison, and experimentation; they are not proof that an ancient
musician performed the resulting MIDI output in that way.

General MIDI instruments are practical modern sound stand-ins, not
replicas of ancient instruments. The current genus options are documented
pitch emulations rather than a complete tetrachord-reconstruction engine.

## Why the project is released

The project is released as a transparent technical and educational tool:
its code, its citations, its stated limitations, and its unresolved
questions can be inspected together. It aims to make scholarly questions
about metre and musical realization easier to hear and test, not to close
them.

Corrections from musicologists, classicists, performers, and developers
are welcome. Please open an issue in the GitHub reository with the relevant evidence where
possible:  
https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer

