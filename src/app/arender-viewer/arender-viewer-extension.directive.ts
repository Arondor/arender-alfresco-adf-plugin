import { AfterContentInit, ContentChild, Directive, Input, TemplateRef } from '@angular/core';
import { PreviewService } from '../services/preview.service';

@Directive({
    selector: 'arender-viewer-extension'
})
export class ArenderViewerExtensionDirective implements AfterContentInit {

    @ContentChild(TemplateRef)
    template: any;

    templateModel: any;

    @Input()
    urlFileContent!: string;

    @Input()
    extension!: string;

    @Input()
    supportedExtensions!: string[];

    constructor(private previewService: PreviewService) {}

    ngAfterContentInit() {  
        this.templateModel = { template: this.template, isVisible: true };
        this.previewService.setTemplate(this.templateModel);
    }
}
