
export namespace enums {
    export enum PackType {
        Invalid,
        Addon,
        Cached,
        CopyProtected,
        Behavior,
        PersonaPiece,
        Resources,
        Skins,
        WorldTemplate,
        Count,
    }

    enum ResourcePackResponse {
        Cancel = 1,
        Downloading,
        DownloadingFinished,
        ResourcePackStackFinished,
    }
}
