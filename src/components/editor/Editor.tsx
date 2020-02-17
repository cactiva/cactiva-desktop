import React from 'react';
import { observer } from 'mobx-react-lite';
import './Editor.scss';
import FileTree from './filetree/FileTree';

export default observer(() => {
    return <div className='editor'>
        <FileTree />
    </div>;
});