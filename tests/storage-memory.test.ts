import {describe, expect, it} from "vitest";
import {MemStorage}           from "../server/storage";

describe("MemStorage", () => {
    it("preserves locally rectified names when Google identity data is refreshed", async () => {
        const storage = new MemStorage();

        await storage.upsertUser({
            id: "user-1",
            email: "person@example.test",
            firstName: "Original",
            lastName: "Name",
        });
        await storage.updateUserData("user-1", { firstName: "Corrected", lastName: "Person" });
        const user = await storage.upsertUser({
            id: "user-1",
            email: "person@example.test",
            firstName: "Google",
            lastName: "Profile",
        });

        expect(user.firstName).toBe("Corrected");
        expect(user.lastName).toBe("Person");
    });

    it("returns download history newest first and honors an optional limit", async () => {
        const storage = new MemStorage();
        const first = await storage.createMidiFile({
            filename: "user_1_first.mid", friendlyName: "First", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });
        const second = await storage.createMidiFile({
            filename: "user_1_second.mid", friendlyName: "Second", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });
        await storage.recordDownload({ userId: "user-1", midiFileId: first.id, filename: first.filename, friendlyName: first.friendlyName });
        await storage.recordDownload({ userId: "user-1", midiFileId: second.id, filename: second.filename, friendlyName: second.friendlyName });

        expect((await storage.getUserDownloads("user-1")).map(download => download.midiFileId)).toEqual([second.id, first.id]);
        expect(await storage.getUserDownloads("user-1", 1)).toHaveLength(1);
        expect(await storage.getUserDownloads("other-user")).toEqual([]);
    });

    it("finds only MIDI files owned by a user filename prefix", async () => {
        const storage = new MemStorage();
        const own = await storage.createMidiFile({
            filename: "user_1_owned.mid", friendlyName: "Owned", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });
        await storage.createMidiFile({
            filename: "user_10_other.mid", friendlyName: "Other", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });
        await storage.createMidiFile({
            filename: "guest_other.mid", friendlyName: "Guest", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });

        expect(await storage.getUserMidiFiles("1")).toEqual([own]);
    });

    it("removes a user and their in-memory download records", async () => {
        const storage = new MemStorage();
        await storage.upsertUser({ id: "user-1", email: "person@example.test" });
        const midi = await storage.createMidiFile({
            filename: "user_1_owned.mid", friendlyName: "Owned", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 1,
        });
        await storage.recordDownload({ userId: "user-1", midiFileId: midi.id, filename: midi.filename, friendlyName: midi.friendlyName });

        await storage.deleteUser("user-1");

        expect(await storage.getUser("user-1")).toBeUndefined();
        expect(await storage.getUserDownloads("user-1")).toEqual([]);
    });

    it("records and updates anonymous usage without database state", async () => {
        const storage = new MemStorage();

        await storage.recordAnonymousUsage({ ipHash: "ip-hash", verseCount: 2, lastUsed: new Date("2026-01-01") });
        await storage.updateAnonymousUsage("ip-hash", 3);
        await storage.updateAnonymousUsage("new-ip-hash", 1);

        expect((await storage.getAnonymousUsage("ip-hash"))?.verseCount).toBe(5);
        expect((await storage.getAnonymousUsage("new-ip-hash"))?.verseCount).toBe(1);
        expect(await storage.getAnonymousUsage("missing")).toBeUndefined();
    });

    it("calculates daily usage from today's downloads and stored verse counts", async () => {
        const storage = new MemStorage();
        const midi = await storage.createMidiFile({
            filename: "user_1_today.mid", friendlyName: "Today", verses: [], instrument: "lyra", tempo: 120, mode: "dorian", verseCount: 3,
        });
        await storage.recordDownload({ userId: "user-1", midiFileId: midi.id, filename: midi.filename, friendlyName: midi.friendlyName });

        expect(await storage.getUserDailyVerseCount("user-1")).toBe(3);
        expect(await storage.getUserDailyVerseCount("other-user")).toBe(0);
    });

    it("updates a user's daily limit and supports the legacy name field", async () => {
        const storage = new MemStorage();
        await storage.upsertUser({ id: "user-1", email: "person@example.test", firstName: "First", lastName: "Last" });

        await storage.setUserDailyLimit("user-1", 250);
        await storage.updateUserData("user-1", { name: "Updated" });

        expect(await storage.getUserDailyLimit("user-1")).toBe(250);
        expect((await storage.getUser("user-1"))?.firstName).toBe("Updated");
        expect(await storage.getUserDailyLimit("missing-user")).toBe(100);
    });

    it("returns the most recent GDPR consent for a user", async () => {
        const storage = new MemStorage();

        const first = await storage.recordGdprConsent("user-1");
        const second = await storage.recordGdprConsent("user-1");
        await storage.recordGdprConsent("user-2");

        expect((await storage.getLatestGdprConsent("user-1"))?.id).toBe(second.id);
        expect(first.id).toBeLessThan(second.id);
        expect(await storage.getLatestGdprConsent("missing-user")).toBeUndefined();
    });

    it("checks unlimited usage against the configured account address", async () => {
        const storage = new MemStorage();
        const previous = process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE;
        process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE = "unlimited@example.test";

        expect(await storage.checkUserIsUnlimited("unlimited@example.test")).toBe(true);
        expect(await storage.checkUserIsUnlimited("regular@example.test")).toBe(false);

        process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE = previous;
    });
});
