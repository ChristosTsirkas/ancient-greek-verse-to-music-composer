// noinspection JSUnusedGlobalSymbols

import {type ClassValue, clsx} from "clsx";
import {twMerge}               from "tailwind-merge";

/** Merges conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Checks whether text contains Greek characters. */
export function validateGreekText(text: string): boolean {
    // Basic validation for Greek text - contains Greek characters
    const greekRegex = /[αβγδεζηθικλμνξοπρστυφχψωάέήίόύώΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏ]/;
    return greekRegex.test(text);
}

/** Checks whether a metrical pattern uses supported symbols. */
export function validateMetrics(metrics: string): boolean {
    // Validate metrical pattern - supports comprehensive Greek prosody including anceps
    const metricsRegex = /^[U\-X\s]+$/;
    return metricsRegex.test(metrics.trim());
}

/** Formats a tempo value for display. */
export function formatTempo(tempo: number): string {
    return `${tempo} BPM`;
}

/** Capitalizes a musical mode name for display. */
export function capitalizeMode(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
}
