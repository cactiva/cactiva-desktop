import { ipcMain } from 'electron';
import nodepath from 'path';
import { Morph } from './libs/morph';
import { parse, stringify } from 'flatted/esm';

export class SourceBackend {
    path = "";

    constructor(win: any) {
        ipcMain.on('source/open', async (event: any, path?: string) => {
            if (path) {
                this.path = path;
                const source = Morph.current?.getSourceFile(nodepath.join(Morph.current.srcPath, path));
                event.sender.send('source/open', stringify(source));
            }
        })
    }
}