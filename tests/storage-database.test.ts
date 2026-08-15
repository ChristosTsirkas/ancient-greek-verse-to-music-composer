import {beforeEach, describe, expect, it, vi} from "vitest";
import {DatabaseStorage}                      from "../server/storage";

const dbMock = vi.hoisted(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
}));
const fsMock = vi.hoisted(() => ({ existsSync: vi.fn(), unlinkSync: vi.fn() }));

vi.mock("../server/db", () => ({ db: dbMock }));
vi.mock("fs", () => fsMock);

const chain = (result: unknown) => {
    const query: any = Promise.resolve(result);
    query.from = vi.fn(() => query);
    query.where = vi.fn(() => query);
    query.orderBy = vi.fn(() => query);
    query.limit = vi.fn(() => query);
    query.values = vi.fn(() => query);
    query.returning = vi.fn(() => query);
    query.onConflictDoUpdate = vi.fn(() => query);
    query.set = vi.fn(() => query);
    return query;
};

describe("DatabaseStorage with mocked Drizzle", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns user and MIDI metadata from mocked queries", async () => {
        const storage = new DatabaseStorage();
        dbMock.select.mockReturnValueOnce(chain([{ id: "user-1", email: "person@example.test" }]))
            .mockReturnValueOnce(chain([{ id: 7, filename: "user_1_file.mid" }]));

        expect(await storage.getUser("user-1")).toMatchObject({ id: "user-1" });
        expect(await storage.getMidiFile(7)).toMatchObject({ id: 7 });
    });

    it("returns safe empty values when read queries fail", async () => {
        const storage = new DatabaseStorage();
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        dbMock.select.mockImplementation(() => { throw new Error("mock database failure"); });

        try {
            expect(await storage.getMidiFile(7)).toBeUndefined();
            expect(await storage.getMidiFileByFilename("missing.mid")).toBeUndefined();
            expect(await storage.getUserDownloads("user-1")).toEqual([]);
            expect(await storage.getUserDailyVerseCount("user-1")).toBe(0);
            expect(await storage.getUserDailyLimit("user-1")).toBe(100);

            expect(consoleError).toHaveBeenNthCalledWith(1, "Error getting MIDI file:", expect.any(Error));
            expect(consoleError).toHaveBeenNthCalledWith(2, "Error getting MIDI file by filename:", expect.any(Error));
            expect(consoleError).toHaveBeenNthCalledWith(3, "Error getting user downloads:", expect.any(Error));
            expect(consoleError).toHaveBeenNthCalledWith(4, "Error getting daily verse count:", expect.any(Error));
            expect(consoleError).toHaveBeenNthCalledWith(5, "Error getting daily limit:", expect.any(Error));
            expect(consoleError).toHaveBeenCalledTimes(5);
        } finally {
            consoleError.mockRestore();
        }
    });

    it("writes named user updates and clears server sessions before user deletion", async () => {
        const storage = new DatabaseStorage();
        const update = chain([]);
        const deletion = chain([]);
        dbMock.update.mockReturnValue(update);
        dbMock.delete.mockReturnValue(deletion);
        dbMock.execute.mockResolvedValue([]);

        await storage.updateUserData("user-1", { firstName: "First", lastName: "Last" });
        await storage.deleteUser("user-1");

        expect(update.set).toHaveBeenCalledWith(expect.objectContaining({ firstName: "First", lastName: "Last" }));
        expect(dbMock.execute).toHaveBeenCalledOnce();
        expect(dbMock.delete).toHaveBeenCalledOnce();
    });

    it("records a MIDI file and download with default storage values", async () => {
        const storage = new DatabaseStorage();
        const midiInsert = chain([{ id: 7, filename: "user_1_file.mid" }]);
        const downloadInsert = chain([{ id: 3, midiFileId: 7 }]);
        dbMock.insert.mockReturnValueOnce(midiInsert).mockReturnValueOnce(downloadInsert);

        await storage.createMidiFile({ filename: "user_1_file.mid", friendlyName: "", verses: [], instrument: "lyra", tempo: 0, mode: "", verseCount: 0 });
        await storage.recordDownload({ userId: "user-1", midiFileId: 7, filename: "user_1_file.mid", friendlyName: "" });

        expect(midiInsert.values).toHaveBeenCalledWith(expect.objectContaining({ friendlyName: null, tempo: 120, mode: "dorian", verseCount: 0 }));
        expect(downloadInsert.values).toHaveBeenCalledWith(expect.objectContaining({ friendlyName: null }));
    });

    it("records, retrieves, and orders GDPR consents through mocked queries", async () => {
        const storage = new DatabaseStorage();
        const consentInsert = chain([{ id: 4, userId: "user-1" }]);
        const consentSelect = chain([{ id: 5, userId: "user-1" }]);
        dbMock.insert.mockReturnValue(consentInsert);
        dbMock.select.mockReturnValue(consentSelect);

        expect(await storage.recordGdprConsent("user-1")).toMatchObject({ id: 4 });
        expect(await storage.getLatestGdprConsent("user-1")).toMatchObject({ id: 5 });
        expect(consentSelect.orderBy).toHaveBeenCalledOnce();
        expect(consentSelect.limit).toHaveBeenCalledWith(1);
    });

    it("retrieves user MIDI files and honors optional history limits", async () => {
        const storage = new DatabaseStorage();
        const files = chain([{ id: 7, filename: "user_1_file.mid" }]);
        const limitedHistory = chain([{ id: 3, midiFileId: 7 }]);
        const fullHistory = chain([{ id: 2, midiFileId: 6 }]);
        dbMock.select.mockReturnValueOnce(files).mockReturnValueOnce(limitedHistory).mockReturnValueOnce(fullHistory);

        expect(await storage.getUserMidiFiles("1")).toHaveLength(1);
        expect(await storage.getUserDownloads("user-1", 25)).toHaveLength(1);
        expect(limitedHistory.limit).toHaveBeenCalledWith(25);
        expect(await storage.getUserDownloads("user-1")).toHaveLength(1);
        expect(fullHistory.limit).not.toHaveBeenCalled();
    });

    it("uses mocked database values for daily usage and limits", async () => {
        const storage = new DatabaseStorage();
        dbMock.select.mockReturnValueOnce(chain([{ verseCount: 12 }]))
            .mockReturnValueOnce(chain([{ dailyVerseLimit: 500 }]));
        const dailyInsert = chain([]);
        dbMock.insert.mockReturnValue(dailyInsert);

        expect(await storage.getUserDailyVerseCount("user-1")).toBe(12);
        expect(await storage.getUserDailyLimit("user-1")).toBe(500);
        await storage.recordDailyUsage("user-1", 2);
        expect(dailyInsert.onConflictDoUpdate).toHaveBeenCalledOnce();
    });

    it("delegates anonymous usage to in-memory storage and respects the unlimited address", async () => {
        const storage = new DatabaseStorage();
        const previous = process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE;
        process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE = "unlimited@example.test";

        await storage.recordAnonymousUsage({ ipHash: "ip", verseCount: 1, lastUsed: new Date() });
        await storage.updateAnonymousUsage("ip", 2);

        expect((await storage.getAnonymousUsage("ip"))?.verseCount).toBe(3);
        expect(await storage.checkUserIsUnlimited("unlimited@example.test")).toBe(true);
        expect(await storage.checkUserIsUnlimited("regular@example.test")).toBe(false);
        process.env.EMAIL_ADDRESS_FOR_UNLIMITED_USAGE = previous;
    });

    it("deletes MIDI and matching score files before their mocked database records", async () => {
        const storage = new DatabaseStorage();
        const selectedFile = chain([{ id: 7, filename: "user_1_file.mid" }]);
        const deleteHistory = chain([]);
        const deleteFile = chain([]);
        dbMock.select.mockReturnValue(selectedFile);
        dbMock.delete.mockReturnValueOnce(deleteHistory).mockReturnValueOnce(deleteFile);
        fsMock.existsSync.mockReturnValue(true);

        await storage.deleteMidiFile(7);

        expect(fsMock.unlinkSync).toHaveBeenCalledTimes(2);
        expect(dbMock.delete).toHaveBeenCalledTimes(2);
        expect(deleteHistory.where).toHaveBeenCalledOnce();
        expect(deleteFile.where).toHaveBeenCalledOnce();
    });
});
