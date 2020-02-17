import { ProjectBackend } from "./project";
import { FileTreeBackend } from "./filetree";

export const backend = {
    project: null as ProjectBackend | null,
    filetree: null as FileTreeBackend | null
};
export const initBackendApi = (win: any, app: any) => {
    backend.project = new ProjectBackend(win);
    backend.filetree = new FileTreeBackend(win);
}
