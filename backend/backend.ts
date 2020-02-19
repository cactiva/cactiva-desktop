import { ProjectBackend } from "./project";
import { FileTreeBackend } from "./filetree";
import { SourceBackend } from "./source";

export const backend = {
    project: null as ProjectBackend | null,
    filetree: null as FileTreeBackend | null,
    source: null as SourceBackend | null
};
export const initBackendApi = (win: any, app: any) => {
    backend.project = new ProjectBackend(win);
    backend.filetree = new FileTreeBackend(win);
    backend.source = new SourceBackend(win);
}
