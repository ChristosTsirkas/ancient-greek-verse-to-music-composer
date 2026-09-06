# Disclosure of AI-assisted development and authorship

This disclosure explains how this research software was made, so that
readers can evaluate the role of generative AI independently of the
scholarly and technical claims of the project.

## Summary

> This project was developed with substantial generative-AI assistance.
> Chris Tsirkas is the sole human author and project director and assumes
> responsibility for the released software, documentation, interpretations,
> and manuscript.

This project was developed through extended collaboration between Chris
Tsirkas and large-language-model assistants. AI systems have assisted with
software implementation, tests, documentation, source organization,
consideration of implementation alternatives, and research-oriented drafting.

Chris Tsirkas directed the project: he set its goals and scope, supplied
and selected the source material used in the project, made design and
historical-method decisions, coded parts of the application, tested audible
output, rejected unsupported claims, and determines what is released.
Generative-AI systems are not listed as authors or contributors with
independent scholarly responsibility. Responsibility for the final released
artifact remains with the named author.

## What this means in practice

AI-generated or AI-assisted material is not treated as evidence merely
because it was produced by a model. Historical and technical claims are
intended to remain traceable to cited sources, documented implementation,
tests, or explicitly identified project decisions. The evidential status of
a claim is therefore determined by its sources and method, not by whether AI
assisted in drafting or implementation.

The application distinguishes, where documented, among:

- attested ancient evidence;
- modern scholarly interpretation;
- the application's own algorithmic or audible interpretation; and
- experimental combinations that are available for exploration but are
  not presented as historically attested.

That distinction is central to the project's method. The source-by-source
record is maintained in [docs/PROVENANCE.md](docs/PROVENANCE.md), technical
behavior is documented in [docs/TECHNICAL_SPECIFICATION.md](docs/TECHNICAL_SPECIFICATION.md),
and unresolved or deferred work is recorded in [docs/TODO.md](docs/TODO.md).
The repository's tests address reproducibility and software behavior;
historical interpretations remain open to scholarly criticism and revision.

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

The project is released as a transparent and reproducible research,
technical, and educational artifact. Its code, citations, implementation
decisions, stated evidential boundaries, and unresolved questions can be
inspected together. It aims to make questions about ancient Greek metre and
musical realization easier to hear, compare, and test without collapsing
the distinction between historical evidence and modern realization.

Corrections from musicologists, classicists, performers, and developers
are welcome. Please open an issue in the GitHub repository with the relevant
evidence where possible:
https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer
