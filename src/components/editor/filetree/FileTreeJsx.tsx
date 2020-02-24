import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(() => {
    return <div>

        {true ? <div><header><div /></header></div> : <span />}

    </div>;
})