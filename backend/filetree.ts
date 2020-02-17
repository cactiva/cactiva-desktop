import { ipcMain } from 'electron';
import path from 'path';
import { baseName } from '../src/components/libs/utils';
import { Morph } from './libs/morph';
import fs from 'fs';
import jetpack from 'fs-jetpack';

export class FileTreeBackend {
    constructor(win: any) {
        ipcMain.on('ctree/newdir', async (event: any, args?: any) => {
            const morph: any = Morph.current;
            if (morph) {
                const to = path.join(args.path);
                morph.project.createDirectory(to);
                await morph.project.save();
                event.sender.send('ctree/newdir', 'ok');
            }
        });

        ipcMain.on('ctree/newfile', async (event: any, args: {
            path: string,
            body?: {
                value: string,
                imports: string
            }
        }) => {
            const morph: any = Morph.current;
            if (morph) {
                const sf = morph.project.createSourceFile(args.path, `
import React from "react";
  
export default () => {
return ${(args.body && args.body.value) ? args.body.value : `<div>${baseName(args.path)}</div>`};
};
`.trim(), { overwrite: true });

                if (args.body && args.body.imports) {
                    morph.processImports(sf, args.body.imports);
                    sf.fixMissingImports();
                    sf.organizeImports();
                }

                await sf.save();
                await morph.project.save();
                await morph.reloadComponentDefinitions();
                event.sender.send('ctree/newfile', 'ok');
            }
        });

        ipcMain.on('ctree/move', async (event: any, args?: any) => {
            const morph: any = Morph.current;
            if (morph) {
                morph.project.resolveSourceFileDependencies();
                const from = path.join(morph.getAppPath(), args.old);
                const to = path.join(morph.getAppPath(), args.new);
                if (fs.lstatSync(from).isDirectory()) {
                    const sf = morph.getDirectory(from);
                    if (sf) {
                        sf.moveImmediatelySync(to);
                        morph.project.saveSync();
                        event.sender.send('ctree/move', 'ok');
                    }
                } else {
                    const sf = morph.getSourceFile(from, true);
                    if (sf) {
                        sf.moveImmediatelySync(to);
                        morph.project.saveSync();
                        event.sender.send('ctree/move', 'ok');
                    }
                }
                morph.reloadComponentDefinitions();
                return null;
            }
        });


        ipcMain.on('ctree/delete', async (event: any, args?: any) => {
            const morph: any = Morph.current;
            if (morph) {
                // morph.project.resolveSourceFileDependencies();
                let p = path.join(morph.getAppPath(), args.path);
                if (fs.lstatSync(p).isDirectory()) {
                    const sf = morph.project.getDirectory(p);
                    if (sf) {
                        sf.forget();
                        morph.project.save();
                        await jetpack.removeAsync(p);
                        event.sender.send('ctree/delete', 'ok');
                    }
                } else {
                    const sf = morph.project.getSourceFile(p);
                    if (sf) {
                        sf.delete();
                        morph.project.save();
                        event.sender.send('ctree/delete', 'ok');
                    }
                }
                // morph.reloadComponentDefinitions();
                return null;
            }
        });

        ipcMain.on('ctree/duplicate', async (event: any, args?: any) => {
            if (Morph.current) {
                const morph: Morph = Morph.current;
                // morph.project.resolveSourceFileDependencies();
                const from = path.join(morph.getAppPath(), args.from);
                let to = path.join(morph.getAppPath(), args.to);
                const ext = path.extname(to);
                const dir = path.dirname(to);
                const base = path.basename(to, path.extname(to));
                let i = 1;
                while (await jetpack.existsAsync(to)) {
                    to = path.join(dir, base + i + ext);
                    i++
                }

                if (fs.lstatSync(from).isFile()) {
                    const sf = morph.getSourceFile(from, true);

                    if (sf) {
                        await sf.copyImmediately(to);
                        event.sender.send('ctree/duplicate', 'ok');
                    }
                }
                // morph.reloadComponentDefinitions();
                return null;
            }
        });
    }

}