import { observable } from "mobx";
import { SourceFile } from "ts-morph";
import { IProjectTree } from "./project";

export const editor = observable({
    source: undefined as (SourceFile | undefined),
    file: undefined as (IProjectTree | undefined)
})
