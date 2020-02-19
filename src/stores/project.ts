import { observable, intercept, toJS } from "mobx";
import { api } from "@src/components/libs/api";
import path from 'path';
import { Project } from "ts-morph";

export class StoreProject {
    name: string = "";
    morph = new Project();
    src: string = "";
    path: string;
    @observable tree: IProjectTree = {
        relativePath: './',
        type: 'dir',
        name: 'root',
        size: 0
    };

    constructor(path: string) {
        this.path = path;
    }

    get srcFullPath() {
        return path.join(this.path, this.src);
    }

    async reload() {
        if (!this.name) {
            const res = await api('project/load', this.path);
            this.name = res.name;
            this.tree = res.tree;
            this.src = res.srcPath;
        } else {
            this.tree = await api('project/tree', this.path);;
        }
    }
}

export interface IProjectTree {
    relativePath: string
    type: 'file' | 'dir'
    name: string
    size: number
    loading?: boolean
    expanded?: boolean
    renaming?: boolean
    children?: IProjectTree[]
}

export const project = observable({
    current: null as (StoreProject | null)
})