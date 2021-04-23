/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, PRIMARY_OUTLET, Router } from "@angular/router";
import { NodesApiService, AuthenticationService, AlfrescoApiService, EcmUserService, AppConfigService } from "@alfresco/adf-core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from "@angular/material/snack-bar";


@Component({
  selector: "app-file-view",
  templateUrl: "file-view.component.html",
  styleUrls: ["file-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class FileViewComponent implements OnInit {
  nodeId: string = null;
  
  arenderURL: string = null;
  versionLabel = null; 
  userName: string = null; 
  urlSafe: SafeResourceUrl; 
  arenderHost: string = this.appConfig.get<string>('arender.host');
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private nodeApiService: NodesApiService,
	private authenticationService: AuthenticationService,
	private ecmUserService: EcmUserService,
	private sanitizer: DomSanitizer,
	private appConfig: AppConfigService,
	private apiService: AlfrescoApiService
  ) {} 

  ngOnInit() {
	  
	this.ecmUserService.getCurrentUserInfo().subscribe(u => {
	  this.userName = u.id;
	});
	
	
    this.route.params.subscribe((params) => {
      const id = params.nodeId;
      if (id) {
        this.nodeApiService.getNode(id).subscribe(
          (node) => {
            if (node && node.isFile) {
              this.nodeId = id;
			  
			  this.apiService
			    .getInstance()
			    .webScript.executeWebScript(
				  'GET',
				  'api/version',
				  { nodeRef: 'workspace://SpacesStore/' + this.nodeId },
				  'alfresco',
				  's'
			    )
			    .then(
				  webScriptdata => {
				    this.versionLabel = webScriptdata[0]['label'];
					this.arenderURL = this.appConfig.get<string>('arender.host') + "?nodeRef=nodeRef=workspace://SpacesStore/" + this.nodeId + "&user=" + this.userName + "&alf_ticket=" + this.authenticationService.getTicketEcm() + "&versionLabel=" + webScriptdata[0]['label'];
					this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.arenderURL);
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
