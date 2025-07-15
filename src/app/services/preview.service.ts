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

import { Injectable, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PreviewService {

    public content!: Blob;
    public name!: string;

    private templateSubject = new BehaviorSubject<{ template: TemplateRef<any> | null, isVisible: boolean }>({ template: null, isVisible: true });

    constructor(private router: Router) { }

    showResource(resourceId: string): void {
        this.router.navigate([{ outlets: { overlay: ['files', resourceId, 'view'] } }]);
    }

    showBlob(name: string, content: Blob): void {
        this.name = name;
        this.content = content;
        this.router.navigate([{ outlets: { overlay: ['preview', 'blob'] } }]);
    }

    getTemplate(): Observable<{ template: TemplateRef<any> | null, isVisible: boolean }> {
        return this.templateSubject.asObservable();
    }
    setTemplate(value: { template: TemplateRef<any>, isVisible: boolean }) {
        this.templateSubject.next(value);
    }
}
