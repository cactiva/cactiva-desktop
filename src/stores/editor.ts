import { observable } from "mobx";
import { IProjectTree } from "./project";

interface IEditorFile {
    tree: IProjectTree
}

export const editor = observable({
    current: null as (IEditorFile | null)
})