import * as React from 'react'
import { render } from "react-dom";

import { App } from './app';

function Root() {

    return (
        <div>
            <App />
        </div>
    )
}

render(<Root />, document.getElementById("root"));