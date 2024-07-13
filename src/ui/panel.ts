import joplin from 'api';

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
        await joplin.views.panels.addScript(this.panelInstance, './ui/panel_react/index.js');
        await joplin.views.panels.show(this.panelInstance);
    }
}