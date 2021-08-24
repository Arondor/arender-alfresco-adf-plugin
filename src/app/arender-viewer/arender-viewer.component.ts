import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService, AuthenticationService, EcmUserService, AlfrescoApiService, LogService, NodesApiService } from '@alfresco/adf-core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, PRIMARY_OUTLET, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'arender-viewer',
  templateUrl: './arender-viewer.component.html',
  styleUrls: ['./arender-viewer.component.scss'],
  host: { class: 'arender-viewer' },
  encapsulation: ViewEncapsulation.None
})
export class ArenderViewerComponent implements OnInit {

  @Input()
  documentBuilderEnabled: boolean = false;

  nameFile: string;

  @Input()
  nodeId: string;

  safeURL: SafeResourceUrl;

  showViewer: boolean = true;

  constructor(
    private apiService: AlfrescoApiService,
    private appConfig: AppConfigService,
    private authenticationService: AuthenticationService,
    private ecmUserService: EcmUserService,
    private logService: LogService,
    private nodeApiService: NodesApiService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) { }

  isSourceDefined(): boolean {
    return this.nodeId ? true : false;
  }

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

    this.route.params.subscribe((params) => {
      const id = params.nodeId;
      if (id) {
        this.nodeApiService.getNode(id).subscribe(
          (node) => {
            if (node) {
              this.nodeId = id;

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
              return;
            }
            this.router.navigate(["/files", id]);
          },
          () => this.router.navigate(["/files", id])
        );
      }
    });
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

  onUploadError(errorMessage: string) {
    this.snackBar.open(errorMessage, "", { duration: 4000 });
  }

  onViewerVisibilityChanged() {
    const primaryUrl = this.router
      .parseUrl(this.router.url)
      .root.children[PRIMARY_OUTLET].toString();
    this.router.navigateByUrl(primaryUrl);
  }
}
