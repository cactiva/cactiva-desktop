import React from 'react';
import { observer } from 'mobx-react-lite';

import { PromptDialog } from './Prompt';
import { ConfirmDialog } from './Confirm';

export default observer(() => {
    return <>
        <PromptDialog />
        <ConfirmDialog />
    </>;
})