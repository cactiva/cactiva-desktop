import { ipcMain } from 'electron';
import jetpack from 'fs-jetpack';
import nodepath from 'path';
import { Morph } from './libs/morph';

export class ProjectBackend {
    path = "";

    constructor(win: any) {
        ipcMain.on('project/load', async (event: any, path?: string) => {
            if (path) {
                this.path = path;
                const packageJsonPath = nodepath.join(this.path, 'package.json');
                if (await jetpack.existsAsync(packageJsonPath)) {
                    event.sender.send('project/load', await Morph.load(this.path));
                    return;
                }

                event.sender.send('project/load', null);
            }
        })

        ipcMain.on('project/tree', async (event: any, path?: string) => {
            if (path) {
                this.path = path;
                const packageJsonPath = nodepath.join(this.path, 'package.json');
                if (await jetpack.existsAsync(packageJsonPath)) {
                    event.sender.send('project/tree', Morph.current?.getTree());
                    return;
                }

                event.sender.send('project/tree', null);
            }
        })
    }
}