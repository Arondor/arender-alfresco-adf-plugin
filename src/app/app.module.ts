import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthModule, CoreModule, TRANSLATION_PROVIDER, TranslateLoaderService, ViewerComponent, ViewerRenderComponent } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { routes } from './app.routes';
import { PreviewService } from './services/preview.service';

// App components
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { DocumentsComponent } from './documents/documents.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import localeFr from '@angular/common/locales/fr';
import { DatePipe, registerLocaleData } from '@angular/common';
import { FileViewComponent } from './file-view/file-view.component';
import { ArenderViewerComponent } from './arender-viewer/arender-viewer.component';
import { ArenderViewerExtensionDirective } from './arender-viewer/arender-viewer-extension.directive';
registerLocaleData(localeFr);

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, {
            useHash: true,
            enableTracing: false // enable for debug only
        }),
        // ADF modules
        CoreModule.forRoot(),
        ContentModule.forRoot(),
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: TranslateLoaderService }
        }),
        AuthModule.forRoot({ useHash: true }),
    ],
    exports: [],
    declarations: [
        AppComponent,
        HomePageComponent,
        LoginPageComponent,
        DocumentsComponent,
        AppLayoutComponent,
        FileViewComponent,
        ArenderViewerComponent,
        ArenderViewerExtensionDirective
    ],
    providers: [
        PreviewService,
        ViewerRenderComponent,
        ViewerComponent,
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'app',
                source: 'resources'
            }
        },
        DatePipe,
        { provide: LOCALE_ID, useValue: 'fr' } 
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(private previewService: PreviewService) {

        let template: any = null;
        this.previewService.getTemplate().subscribe(result => {
            template = result;
        });

        (ViewerRenderComponent.prototype as any).ngOnChangesSave = ViewerRenderComponent.prototype.ngOnChanges;
        ViewerRenderComponent.prototype.ngOnChanges = function () {
            if(template.template != null && this.extensionTemplates.length === 0) {
                this.extensionTemplates.push(template);
                this.viewerType = "custom";
            }  
        };
    }

}
