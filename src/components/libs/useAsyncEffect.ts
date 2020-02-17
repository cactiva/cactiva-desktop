import React from 'react';

export function useAsyncEffect(effect: any, destroy?: any, inputs?: any) {
    let hasDestroy = typeof destroy === 'function';

    React.useEffect(function () {
        let result: any = null;
        let mounted = true;
        let maybePromise = effect(function () {
            return mounted;
        });

        Promise.resolve(maybePromise).then(function (value) {
            result = value;
        });

        return function () {
            mounted = false;

            if (hasDestroy) {
                destroy(result);
            }
        };
    }, (hasDestroy ? inputs : destroy) || []);
}