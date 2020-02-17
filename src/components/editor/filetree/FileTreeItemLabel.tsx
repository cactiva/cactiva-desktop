import { baseName, titleCase } from '@src/components/libs/utils';
import { observer, useObservable } from 'mobx-react-lite';
import { Label, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import React, { useEffect, useRef } from 'react';
import { AiOutlineFileText } from 'react-icons/ai';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { IFileTreeItem } from './FileTreeItem';

interface IFileTreeItemLabel extends IFileTreeItem {
    active: boolean
    focus: boolean
    isExpanded: boolean
    onClick: (e: any) => void
    onContextMenu: (e: any) => void
    onRename: (e: any) => void
    divRef?: any
}

const FileIcon = <AiOutlineFileText className="icon file" />;
const FolderIcon = <IoIosArrowForward className="icon" />;
const FolderOpenIcon = <IoIosArrowDown className="icon" />;
const SpinnerIcon = <Spinner size={SpinnerSize.small} style={{ marginRight: 5 }} />;

export default observer(({ item, parent, level, focus, active, onClick, onContextMenu, onRename, isExpanded }: IFileTreeItemLabel) => {
    const meta = useObservable({
        newname: baseName(item.name)
    })

    const inputRef = useRef(null as any);
    useEffect(() => {
        if (item.renaming && inputRef.current) {
            inputRef.current.focus();
        }
    }, [item.renaming]);

    if (item.renaming) {
        const submit = () => {
            item.renaming = false;
            onRename(meta.newname);
        }
        return <>
            <div
                onClick={submit}
                onContextMenu={submit}
                className="overlay"></div>
            <div
                className={`item renaming active`}
                style={{ paddingLeft: level * 8 + 'px' }}>
                <div className="inner">
                    {item.loading
                        ? SpinnerIcon
                        : item.type === 'file'
                            ? FileIcon
                            : isExpanded
                                ? FolderOpenIcon
                                : FolderIcon}
                    <div className="label-container">
                        <input
                            className="label"
                            ref={inputRef}
                            value={meta.newname}
                            onChange={(e: any) => {
                                if (item.type === 'file') {
                                    meta.newname = titleCase(e.target.value.replace(/\s/ig, ''));
                                } else {
                                    meta.newname = e.target.value.replace(/\s/ig, '').toLowerCase();
                                }
                            }}
                            onBlur={(e: any) => {
                                submit();
                            }}
                            onKeyDown={(e: any) => {
                                if (e.which === 13) {
                                    e.target.blur();
                                }
                            }} />
                    </div>
                </div>
            </div>
        </>
    }

    return <div
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={`item ${item.type} ${active ? 'active' : ''} ${focus ? 'focus' : ''}`}
        style={{ paddingLeft: level * 8 + 'px' }}>
        <div className="inner">
            {item.loading
                ? SpinnerIcon
                : item.type === 'file'
                    ? FileIcon
                    : isExpanded
                        ? FolderOpenIcon
                        : FolderIcon}
            <Label className="label" style={{ padding: 0, margin: 0 }}>
                {baseName(item.name)}
            </Label>
        </div>
    </div>
})