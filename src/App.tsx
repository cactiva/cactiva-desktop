import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { hot, setConfig } from "react-hot-loader";
import Dialogs from "./components/dialogs/Dialogs";
import Editor from "./components/editor/Editor";
import { useAsyncEffect } from "./components/libs/useAsyncEffect";
import initUI from "./initUI";
import { project, StoreProject } from "./stores/project";

setConfig({
  showReactDomPatchNotification: false
});
initUI();

export default hot(module)(
  observer(() => {
    const meta = useObservable({
      loading: true
    });

    useAsyncEffect(async () => {
      project.current = new StoreProject(process.cwd());
      await project.current.reload();
      meta.loading = false;
    });

    return (
      <>
        {meta.loading ? (
          <img width="100" src="./assets/images/logo.png" />
        ) : (
          <Editor />
        )}
        <Dialogs />
      </>
    );
  })
);
