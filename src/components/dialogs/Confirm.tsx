import React from 'react';
import { observer, useObservable } from 'mobx-react-lite';
import { Dialog, DialogType, ContextualMenu, DialogFooter, PrimaryButton, DefaultButton, TextField } from 'office-ui-fabric-react';
import { observable } from 'mobx';
import _ from 'lodash';
import "./Dialogs.scss";
const meta = observable({
    title: '',
    subtitle: '',
    hidden: true,
    placeholder: '',
    onChange: undefined as any,
    resolve: null as any
});
export const ConfirmDialog = observer(() => {
    const closeDialog = () => {
        meta.hidden = true;
        if (meta.resolve) {
            meta.resolve(true);
        }
    }
    const cancelDialog = () => {
        meta.hidden = true;
        if (meta.resolve) {
            meta.resolve(false);
        }
    }
    return <>
        <Dialog
            className="prompt-dialog"
            hidden={meta.hidden}
            onDismiss={cancelDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: meta.title,
                closeButtonAriaLabel: 'Close',
                subText: meta.subtitle
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 450, minHeight: 100 } },
                dragOptions: {
                    moveMenuItemText: 'Move',
                    closeMenuItemText: 'Close',
                    menu: ContextualMenu
                }
            }}
        >
            <DialogFooter>
                <PrimaryButton onClick={closeDialog} text="OK" />
                <DefaultButton onClick={cancelDialog} text="Cancel" />
            </DialogFooter>
        </Dialog>
    </>;
})

export const confirm = (title: string, opt?: {
    default?: string,
    subtitle?: string,
    placeholder?: string,
    onChange?: any
}): Promise<string> => {
    return new Promise(resolve => {
        meta.title = title;
        meta.hidden = false;
        meta.subtitle = _.get(opt, 'subtitle') || '';
        meta.onChange = _.get(opt, 'onChange');
        meta.placeholder = _.get(opt, 'placeholder') || '';
        meta.resolve = resolve;
    });
}