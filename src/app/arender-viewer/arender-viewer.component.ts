import { Component, ViewEncapsulation, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService, AuthenticationService, EcmUserService, AlfrescoApiService, LogService, NodesApiService } from '@alfresco/adf-core';

@Component({
  selector: 'arender-viewer',
  templateUrl: './arender-viewer.component.html',
  styleUrls: ['./arender-viewer.component.scss'],
  host: { class: 'arender-viewer' },
  encapsulation: ViewEncapsulation.None
})
export class ArenderViewerComponent implements OnInit {

  /** Node Id of the file to load. */
  @Input()
  nodeId: string = null;

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
  documentBuilderEnabled: boolean = false;

  /** Emitted when the viewer is shown or hidden. */
  @Output()
  showViewerChange = new EventEmitter<boolean>();

  /** Emitted when user clicks 'Navigate Before' ("<") button. */
  @Output()
  navigateBefore = new EventEmitter<MouseEvent | KeyboardEvent>();

  /** Emitted when user clicks 'Navigate Next' (">") button. */
  @Output()
  navigateNext = new EventEmitter<MouseEvent | KeyboardEvent>();

  safeURL: SafeResourceUrl = null;

  extensions = this.appConfig.get<string>('arender.extensions');

  constructor(
    private apiService: AlfrescoApiService,
    private logService: LogService,
    private appConfig: AppConfigService,
    private authenticationService: AuthenticationService,
    private ecmUserService: EcmUserService,
    private nodeApiService: NodesApiService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
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
      alfTicket = this.apiService.getInstance().config.ticketEcm
    } else {
      alfTicket = this.authenticationService.getTicketEcm();
    }

    this.nodeApiService.getNode(this.nodeId).subscribe(
      (node) => {
        if (node) {
          this.apiService
            .getInstance()
            .webScript.executeWebScript('GET', 'api/version', { nodeRef: 'workspace://SpacesStore/' + this.nodeId }, 'alfresco', 's')
            .then(
              (webScriptdata) => {
                versionLabel = webScriptdata[0]['label'];
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

  onNavigateBeforeClick(event: MouseEvent | KeyboardEvent) {
    this.navigateBefore.next(event);
  }

  onNavigateNextClick(event: MouseEvent | KeyboardEvent) {
    this.navigateNext.next(event);
  }

  onVisibilityChanged(event: boolean) {
    this.showViewerChange.next(event)
  }
}
