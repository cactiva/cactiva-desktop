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
    value: '',
    originalValue: '',
    onChange: undefined as any,
    resolve: null as any
});
export const PromptDialog = observer(() => {
    const closeDialog = () => {
        meta.hidden = true;
        if (meta.resolve) {
            meta.resolve(meta.value);
        }
    }
    const cancelDialog = () => {
        meta.hidden = true;
        if (meta.resolve) {
            meta.resolve(meta.originalValue);
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
                styles: { main: { maxWidth: 450 } },
                dragOptions: {
                    moveMenuItemText: 'Move',
                    closeMenuItemText: 'Close',
                    menu: ContextualMenu
                }
            }}
        >
            <TextField placeholder={meta.placeholder} autoFocus={true}
                onFocus={(e) => {
                    e.target.select();
                }}
                value={meta.value} onKeyDown={(e) => {
                    if (e.which === 13) closeDialog();
                }} onChange={(e: any) => {
                    if (meta.onChange) {
                        meta.value = meta.onChange(e.target.value);
                    } else {
                        meta.value = e.target.value;
                    }
                }} />
            <DialogFooter>
                <PrimaryButton onClick={closeDialog} text="OK" />
                <DefaultButton onClick={cancelDialog} text="Cancel" />
            </DialogFooter>
        </Dialog>
    </>;
})

export const prompt = (title: string, opt?: {
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
        meta.value = _.get(opt, 'default') || '';
        meta.originalValue = _.get(opt, 'default') || '';
        meta.resolve = resolve;
    });
}