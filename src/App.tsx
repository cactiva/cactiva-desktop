import { observer, useObservable } from 'mobx-react-lite';
import { createTheme, loadTheme, registerIcons, setIconOptions } from 'office-ui-fabric-react';
import React from 'react';
import { IoMdAdd, IoMdArrowDropdown, IoMdClose } from 'react-icons/io';
import Dialogs from './components/dialogs/Dialogs';
import Editor from './components/editor/Editor';
import { api } from './components/libs/api';
import { useAsyncEffect } from './components/libs/useAsyncEffect';
import { StoreProject, project } from './stores/project';

loadTheme(createTheme({
    defaultFontStyle: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, Helvetica, Arial, sans-serif'
    },
}));

registerIcons({
    icons: {
        'Clear': <IoMdClose style={{ width: 16, height: 16 }} />,
        'Add': <IoMdAdd style={{ width: 16, height: 16 }} />,
        'ChevronDown': <IoMdArrowDropdown style={{ width: 16, height: 16 }} />,
    },
});
setIconOptions({
    disableWarnings: true
});

export default observer(() => {
    const meta = useObservable({
        loading: true
    });

    useAsyncEffect(async () => {
        project.current = new StoreProject(process.cwd());
        await project.current.reload();
        meta.loading = false;
    })

    return <>
        {meta.loading
            ? <img width="100" src='./assets/images/logo.png' />
            : <Editor />}
        <Dialogs />
    </>;
});
