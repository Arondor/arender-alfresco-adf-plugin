import { Component, ViewEncapsulation, OnInit, Input, EventEmitter, Output, Injector } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService, AuthenticationService, LogService, StorageService } from '@alfresco/adf-core';
import { WebscriptApi } from '@alfresco/js-api';
import { AlfrescoApiService, NodesApiService, PeopleContentService } from '@alfresco/adf-content-services';
import { Location } from '@angular/common';

@Component({
  selector: 'app-arender-viewer',
  templateUrl: './arender-viewer.component.html',
  styleUrls: ['./arender-viewer.component.css'],
  host: { class: 'arender-viewer' },
  encapsulation: ViewEncapsulation.None
})
export class ArenderViewerComponent implements OnInit {

  /** Node Id of the file to load. */
  @Input()
  nodeId!: string;

  /** If `true` then show the Viewer as a full page over the current content.
   * Otherwise fit inside the parent div.
   */
  @Input()
  overlayMode = false;

  /** Hide or show the viewer */
  @Input()
  showViewer = true;

  /** Hide or show the toolbar */
  @Input()
  showToolbar = true;

  /** Toggles before/next navigation. You can use the arrow buttons to navigate
   * between documents in the collection.
   */
  @Input()
  allowNavigate = false;

  /** Toggles the "before" ("<") button. Requires `allowNavigate` to be enabled. */
  @Input()
  canNavigateBefore = true;

  /** Toggles the next (">") button. Requires `allowNavigate` to be enabled. */
  @Input()
  canNavigateNext = true;

  /** Allow the left the sidebar. */
  @Input()
  allowLeftSidebar = false;

  /** Allow the right sidebar. */
  @Input()
  allowRightSidebar = false;

  /** Toggles right sidebar visibility. Requires `allowRightSidebar` to be set to `true`. */
  @Input()
  showRightSidebar = false;

  /** Toggles left sidebar visibility. Requires `allowLeftSidebar` to be set to `true`. */
  @Input()
  showLeftSidebar = false;

  @Input()
  documentBuilderEnabled = false;

  /** Emitted when the viewer is shown or hidden. */
  @Output()
  showViewerChange = new EventEmitter<boolean>();

  /** Emitted when user clicks 'Navigate Before' ("<") button. */
  @Output()
  navigateBefore = new EventEmitter<MouseEvent | KeyboardEvent>();

  /** Emitted when user clicks 'Navigate Next' (">") button. */
  @Output()
  navigateNext = new EventEmitter<MouseEvent | KeyboardEvent>();

  safeURL!: SafeResourceUrl;
  name = '/';

  webScript: WebscriptApi;

  private apiService: AlfrescoApiService;
  private logService: LogService;
  private appConfig: AppConfigService;
  private authenticationService: AuthenticationService;
  private ecmUserService: PeopleContentService;
  private nodeApiService: NodesApiService;
  private sanitizer: DomSanitizer;
  private storageService: StorageService;

  constructor(private injector: Injector, private location: Location) {
    this.apiService = injector.get<AlfrescoApiService>(AlfrescoApiService);
    this.logService = injector.get<LogService>(LogService);
    this.appConfig = injector.get<AppConfigService>(AppConfigService);
    this.authenticationService = injector.get<AuthenticationService>(AuthenticationService);
    this.ecmUserService = injector.get<PeopleContentService>(PeopleContentService);
    this.nodeApiService = injector.get<NodesApiService>(NodesApiService);
    this.sanitizer = injector.get<DomSanitizer>(DomSanitizer);
    this.storageService = injector.get<StorageService>(StorageService);
    this.webScript = new WebscriptApi(this.apiService.getInstance());
  }

  async ngOnInit() {
    let alfTicket: string;
    let arenderHost: string;
    let arenderURL: string;
    let userName: string;
    let versionLabel: string;

    arenderHost = this.appConfig.get<string>('arender.host');
    this.ecmUserService.getCurrentUserInfo().subscribe(u => {
      userName = u.id;
    });
    if (this.authenticationService.isOauth()) {
      alfTicket = this.apiService.getInstance().config.ticketEcm || "";
      // Try to fallback in a standard a way to get the ticket
      if (alfTicket === undefined) {
        alfTicket = this.apiService.getInstance().contentAuth.getTicket();
      }
      // Ticket is still undefined, making call to Alfresco API to get the ticket
      if (alfTicket === undefined) {
        alfTicket = await this.getTicketFromAPI();
      }
    } else {
      alfTicket = this.authenticationService.getToken();
    }

    this.nodeApiService.getNode(this.nodeId).subscribe(
      (node) => {
        if (node) {
          this.webScript.executeWebScript('GET', 'api/version', { nodeRef: 'workspace://SpacesStore/' + this.nodeId }, 'alfresco', 's')
            .then(
              (webScriptdata) => {
                versionLabel = webScriptdata[0]['label'];
                this.name = '/' + webScriptdata[0]['name'];
                arenderURL = arenderHost + this.buildArenderURLParameters(userName, alfTicket, versionLabel, node.isFolder);
                this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(arenderURL);
              },
              (error) => {
                this.logService.log('Error' + error);
              }
            );
        }
      }
    );
  }

  onExtensionChange(ext: any) {
    console.log('onExtensionChange: ' + ext);
  }

  buildArenderURLParameters(userName: string, alfTicket: string, versionLabel: string, isFolder: boolean): string {
    let arenderParams: string;

    arenderParams = '?nodeRef=workspace://SpacesStore/' + this.nodeId;
    if (alfTicket != null) {
      arenderParams = arenderParams + '&alf_ticket=' + alfTicket;
    }
    if (versionLabel != null) {
      arenderParams = arenderParams + '&versionLabel=' + versionLabel;
    }
    if (isFolder) {
      arenderParams = arenderParams + '&folder=true';
    }
    arenderParams = arenderParams + '&user=' + userName;
    if (this.documentBuilderEnabled) {
      arenderParams = arenderParams + '&documentbuilder.enabled=true';
    }
    return arenderParams;
  }

  async getTicketFromAPI(): Promise<any> {
    const uri = this.appConfig.get<string>('ecmHost') + '/alfresco/api/-default-/public/authentication/versions/1/tickets/-me-';

    let ssoToken: string;
    if (this.apiService.getInstance().oauth2Auth.token) {
      ssoToken = this.apiService.getInstance().oauth2Auth.token;
    } else {
      ssoToken = this.storageService.getItem('access_token') || "";
    }

    const headerParams = {
        Authorization: 'Bearer ' + ssoToken
    };

    const response = await this.apiService.getInstance().oauth2Auth.
    callCustomApi(uri, 'GET', {}, {}, headerParams, {}, {}, ['application/json'], ['application/json']);
    return response.entry.id;
  }

  onNavigateBeforeClick(event: MouseEvent | KeyboardEvent) {
    this.navigateBefore.next(event);
  }

  onNavigateNextClick(event: MouseEvent | KeyboardEvent) {
    this.navigateNext.next(event);
  }

  onVisibilityChanged(event: boolean) {
    this.location.back();
  }
}
