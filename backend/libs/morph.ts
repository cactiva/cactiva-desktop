import { app } from "electron";
import jetpack from "fs-jetpack";
import _ from 'lodash';
import nodepath from 'path';
import { ImportDeclarationStructure, Project as TProject, SourceFile, StructureKind } from "ts-morph";
import { cleanHooks } from "./utils/cleanHooks";
import { defaultExport, defaultExportShallow } from "./utils/defaultExport";
import { generateSource } from "./utils/generateSource";
import { getHooks } from "./utils/getHooks";
import { getImports } from "./utils/getImports";
import { getEntryPoint, parseJsx } from "./utils/parseJsx";
import { replaceReturn } from "./utils/replaceReturn";

interface IMorphResult {
    name: string
    srcPath: string
    tree: any
}

export class Morph {
    project: TProject = new TProject();
    name: string;
    path: string;
    srcPath: string = 'src';
    hasTsConfig: boolean = false;

    getAppPath() {
        return this.path;
    }

    randomDigits() {
        return Math.random()
            .toString()
            .slice(2, 11);
    }

    parseExpression(source: string) {
        const tempfile = app.getPath("temp") + this.randomDigits() + "__.tsx";
        const sf = this.project.createSourceFile(tempfile,
            `${source}`
        );
        let result = null as any;
        try {
            const fc = getEntryPoint(sf.getFirstChild()) as any;
            result = parseJsx(fc);
        } finally {
            sf.forget();
            (async () => {
                if (await jetpack.existsAsync(tempfile)) {
                    await jetpack.removeAsync(tempfile);
                }
            })()
        }
        return result;
    }

    parseJsxExpression(source: string) {
        // const sourced = `<div>${source}</div>`;
        const tempfile = app.getPath("temp") + this.randomDigits() + "__.tsx";
        const sf = this.project.createSourceFile(tempfile, `<div>${source}</div>`);
        let result = null as any;
        try {
            const fc = getEntryPoint(sf.getFirstChild()) as any;
            result = parseJsx(fc).children[0];
        } finally {
            sf.forget();
            (async () => {
                if (await jetpack.existsAsync(tempfile)) {
                    await jetpack.removeAsync(tempfile);
                }
            })()
        }
        return result;
    }

    getDirectory(name: string) {
        return this.project.getDirectoryOrThrow(name);
    }

    getSourceFile(filename: string, isAbsolutePath = false) {
        const cpath = nodepath.join((!isAbsolutePath ? this.getAppPath() : ""), filename);
        const itemName = nodepath.resolve(cpath);
        try {
            return this.project.getSourceFileOrThrow(item => {
                return nodepath.resolve(item.getFilePath()) === itemName;
            });
        } catch (e) {
            try {
                this.reload();
                return this.project.getSourceFileOrThrow(item => {
                    return nodepath.resolve(item.getFilePath()) === itemName;
                });
            } catch (e) {
                return null;
            }
        }
    }

    createTempSource(source: string, callback: any) {
        const tempfile = app.getPath("temp") + this.randomDigits() + "__.tsx";
        const sf = this.project.createSourceFile(tempfile, source);
        let result = null as any;
        try {
            callback(sf);
        } catch (e) {
            console.log(e);
        } finally {
            sf.forget();
            sf.deleteImmediately();
        }

        return result;
    }

    async readTsx(filename: string, showKindName = false) {
        const sf = this.getSourceFile(filename);
        if (sf) {
            await sf.refreshFromFileSystem();
            const result = await this.formatCactivaSource(sf, showKindName);
            await sf.refreshFromFileSystem();
            return result;
        } return null;
    }

    async formatCactivaSource(sf: SourceFile, showKindName = false) {
        const de = defaultExport(sf);
        const ps = parseJsx(getEntryPoint(de), showKindName);
        return {
            file: await replaceReturn(sf, "<<<<cactiva>>>>"),
            imports: getImports(sf),
            hooks: getHooks(sf),
            component: ps
        };
    }


    processImports(sf: SourceFile, postedImports: any) {
        const currentImports = getImports(sf)
        for (let i in postedImports) {
            if (!currentImports[i]) {
                const im = postedImports[i];
                currentImports[i] = im;
                const imstruct: ImportDeclarationStructure = {
                    kind: StructureKind.ImportDeclaration,
                    moduleSpecifier: im.from
                };
                if (im.type === "default") {
                    imstruct.defaultImport = i;
                } else {
                    imstruct.namedImports = [i];
                }
                sf.addImportDeclaration(imstruct);
            }
        }
    }

    processHooks(sf: SourceFile, postedHooks: any) {
        cleanHooks(sf);
        const de = defaultExportShallow(sf);
        const dp = de.getParent();
        const hookSource = postedHooks
            .map((hook: any, index: number) => {
                const body = generateSource(hook);
                if (typeof body !== "string") {
                    console.log("generateSource: kind not found!!! - in processHooks()");
                    return "";
                }
                return body;
            })
            .join("\n");
        dp.setBodyText(`\n${hookSource}\n\n` + _.trim(de.getText().trim(), "{}"));
    }

    public getTree() {
        const tree: any = jetpack.inspectTree(
            nodepath.join(this.path, this.srcPath),
            {
                relativePath: true
            }
        );
        const exclude = [
            // "./assets",
            // "./libs",
            // "./config",
            // "./stores",
            // "./api",
            "./.DS_",
            "./components.ts",
            "./fonts.ts",
            "./theme.json"
        ];
        const filterTree = (e: any) => {
            for (let ex of exclude) {
                if (e.relativePath.indexOf(ex) === 0) return false;
            }

            const ext = e.relativePath.split(".").pop();
            if (e.type === 'file' && (ext !== "tsx" && ext !== 'jsx')) return false;
            if (e.type === 'dir') {
                e.children = e.children.map(filterTree).filter((m: any) => !!m);
                // if (e.children.length === 0) return false;
            }

            return e;
        };

        tree.children = tree.children.map(filterTree).filter((e: any) => !!e);
        return tree;
    }

    async reload(): Promise<IMorphResult> {
        process.chdir(this.getAppPath());
        let errors = "";
        try {
            if (this.hasTsConfig) {
                this.project.addSourceFilesFromTsConfig(nodepath.join(".", "tsconfig.json"));
            } else {
                this.project.addSourceFilesAtPaths(`${this.path}/**/*{.d.ts,.ts,.tsx,.js.jsx}`);
                this.project.resolveSourceFileDependencies();
            }
        } catch (r) {
            errors = r;
        }
        const result: any = {
            name: this.name,
            srcPath: this.srcPath,
            tree: this.getTree()
        };

        if (errors) {
            result.errors = errors;
        }

        return result;
    }

    public async reloadComponentDefinitions() {
        const sf = this.getSourceFile("/src/components.ts");
        if (sf) {
            sf.forEachChild((child: any) => {
                if (child.getKindName() === "ExportAssignment") {
                    const flatten = (obj: any[]) => {
                        const res: any[] = [];
                        obj.forEach((e: any) => {
                            if (e.type === 'file') {
                                res.push({ ...e, children: null });
                            }
                            if (e.children) {
                                flatten(e.children).map(f => {
                                    if (f.type === 'file') {
                                        res.push(f);
                                    }
                                })
                            }
                        });
                        return res;
                    }
                    const tree = this.getTree();
                    const components: string[] = flatten(tree.children);
                    child.getExpression().replaceWithText(`{
\t${components.map((e: any) => {
                        const path = e.relativePath.replace(".tsx", "");
                        return `"${path.substr(2, e.relativePath.length - 2)}":require("${path}").default`;
                    }).join(',\n\t')}
 }`);
                }
            });

            await sf.save()
        }
    }

    async getTypes() {
        const typesPath = this.getAppPath();
        const memory = await this.project.emitToMemory({ emitOnlyDtsFiles: true });
        const result = {} as any;
        memory.getFiles().map((item) => {
            result['@' + item.filePath.substr(typesPath.length)] = item.text;
        })
        return result;
    }

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    static async load(path: string): Promise<IMorphResult> {
        const caches = Morph.caches;
        if (caches[path]) {
            Morph.current = caches[path];
            return await caches[path].reload();
        }
        else {
            const packageJsonPath = nodepath.join(path, 'package.json');
            const rawPkg = await jetpack.readAsync(packageJsonPath);
            const pkg = JSON.parse(rawPkg || '{}');
            caches[pkg.name] = new Morph(pkg.name, path);
            process.chdir(path);
            if (await jetpack.existsAsync(nodepath.join(".", "tsconfig.json"))) {
                caches[pkg.name].hasTsConfig = true;
                caches[pkg.name].project = new TProject({
                    tsConfigFilePath: nodepath.join(".", "tsconfig.json"),
                });
            }
            Morph.current = caches[pkg.name];
            return await caches[pkg.name].reload();
        }
    }
    static caches: { [key: string]: Morph } = {};
    static current: (Morph | null) = null;
}
