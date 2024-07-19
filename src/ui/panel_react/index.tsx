import * as React from 'react';
import { render } from "react-dom";
import { AppProvider } from './AppContext';

import App from './app'

function Root() {
    return (
        <AppProvider>
            <App />
        </AppProvider>
    );
}

render(<Root />, document.getElementById("root"));
