export interface Source {
    copyContent: (destinationPath: string) => Promise<void>;
}