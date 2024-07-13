import joplin from 'api';

const fs = require('fs-extra');

export class SummarisationPanel {
    public panelInstance;

    async showPanel() {
    
    }

    async hidePanel() {

    }

    private async generatePanelHtml() {
        return `
            <div id="root">
            </div>
        `;
    }

    async registerPanel() {
        this.panelInstance = await joplin.views.panels.create('summary-ai-panel');
        const panelHtml: string = await this.generatePanelHtml();
        await joplin.views.panels.setHtml(this.panelInstance, panelHtml);

        const installationDir = await joplin.plugins.installationDir();
        const files = await fs.promises.readdir(installationDir + '/ui/panel_react/styles/');
        const cssFiles = files.filter((file) => file.endsWith('.css')).map((file) => 'ui/panel_react/styles/' + file);

        for(const css of cssFiles) {
            await joplin.views.panels.addScript(this.panelInstance, css);
        }

        await joplin.views.panels.addScript(this.panelInstance, './ui/panel_react/index.js');
        await joplin.views.panels.show(this.panelInstance);
    }
}