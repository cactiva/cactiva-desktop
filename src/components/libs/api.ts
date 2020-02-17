import { ipcRenderer as ipc } from 'electron';
import { observable, observe, toJS } from 'mobx';
import _ from 'lodash';

const API_TIMEOUT = 10;
const results = observable({} as any);
export const api = (name: string, args?: any): any => {
    return new Promise(resolve => {
        const cb = (event: any, args?: any) => {
            results[name] = args;
        };
        results[name] = undefined;
        ipc.on(name, cb);
        ipc.send(name, args);
        let returned = false;
        const observeCallback = (change: any) => {
            returned = true;
            unwatch();
            ipc.removeListener(name, cb);
            resolve(toJS(change.newValue));
        };
        const unwatch = observe(results, name, observeCallback);

        setTimeout(() => {
            if (!returned) {
                console.log(`api ${name} timed out... (${API_TIMEOUT})`)
                observeCallback({ newValue: undefined });
            }
        }, API_TIMEOUT * 1000);
    });
}
