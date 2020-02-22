import { observable } from "mobx";
import { SourceFile, Node } from "ts-morph";
import { IProjectTree } from "./project";

export const editor = observable({
    breadcrumbs: [] as Node[],
    source: undefined as (SourceFile | undefined),
    file: undefined as (IProjectTree | undefined)
})
