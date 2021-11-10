import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { createDeliveryClient, DeliveryClient, IContentItemsContainer } from '@kentico/kontent-delivery';
import { environment } from 'src/environments/environment';
import { CoreComponent } from './core/core.component';
import { KontentService } from './services/kontent.service';
import { DeliveryService } from './services/delivery.service';
import { map } from 'rxjs';
import { TrainingHotGraphic } from './models/training_hot_graphic';
import { TrainingHotGraphicPin } from './models/training_hot_graphic_pin';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends CoreComponent implements OnInit, AfterViewChecked {
    // config
    public projectId?: string;
    public previewApiKey?: string;

    // base
    public loading: boolean = false;
    public errorMessage?: string;
    public infoMessage?: string;

    // state
    public disabled: boolean = false;

    // context
    public itemCodename?: string;
    public languageCodename?: string;

    private client?: DeliveryClient;

    // hot graphics
    public hotGraphics?: TrainingHotGraphic;
    public pins: TrainingHotGraphicPin[] = [];

    public get imageUrl(): string | undefined {
        if (!this.hotGraphics || this.hotGraphics.elements.graphic.value.length === 0) {
            return undefined;
        }

        return this.hotGraphics.elements.graphic.value[0].url;
    }

    constructor(
        private deliveryService: DeliveryService,
        private kontentService: KontentService,
        cdr: ChangeDetectorRef
    ) {
        super(cdr);
    }

    ngOnInit(): void {
        if (this.isKontentContext()) {
            this.kontentService.initCustomElement(
                (data) => {
                    this.projectId = data.projectId;
                    this.previewApiKey = data.previewApiKey;
                    this.languageCodename = data.context.variant.codename;
                    this.itemCodename = data.context.item.codename;
                    this.disabled = data.isDisabled;

                    console.log('top value', data.getElementValue('top'));

                    this.client = this.getDeliveryClient(this.projectId, this.previewApiKey);

                    if (this.client && this.itemCodename && this.languageCodename) {
                        this.initHotGraphics(this.client, this.itemCodename, this.languageCodename);
                    }
                },
                (error) => {
                    console.error(error);
                    this.errorMessage = `Could not initialize custom element. Custom elements can only be embedded in an iframe`;
                    super.detectChanges();
                }
            );
        } else {
            this.projectId = this.getDefaultProjectId();
            this.previewApiKey = this.getDefaultManagementApiKey();
            this.languageCodename = this.getDefaultTargetLanguageCodename();
            this.itemCodename = this.getDefaultContentItemCodename();

            this.client = this.getDeliveryClient(this.projectId, this.previewApiKey);

            if (this.client && this.itemCodename && this.languageCodename) {
                this.initHotGraphics(this.client, this.itemCodename, this.languageCodename);
            }
        }
    }

    ngAfterViewChecked(): void {
        // update size of Kontent UI
        if (this.isKontentContext()) {
            // this is required because otherwise the offsetHeight can return 0 in some circumstances
            // https://stackoverflow.com/questions/294250/how-do-i-retrieve-an-html-elements-actual-width-and-height
            setTimeout(() => {
                const htmlElement = document.getElementById('htmlElem');
                if (htmlElement) {
                    const height = htmlElement.offsetHeight;
                    this.kontentService.updateSizeToMatchHtml(height);
                }
            }, 50);
        }
    }

    private startLoading(): void {
        this.loading = true;
    }

    private stopLoading(): void {
        this.loading = false;
    }

    private initHotGraphics(client: DeliveryClient, itemCodename: string, languageCodename: string): void {
        this.startLoading();
        super.subscribeToObservable(
            this.deliveryService
                .getHotGrahpics({
                    client: client,
                    languageCodename: languageCodename,
                    itemCodename: itemCodename
                })
                .pipe(
                    map((response) => {
                        this.hotGraphics = response.hotGraphics;

                        if (response.hotGraphics) {
                            this.pins = this.getPins(response.hotGraphics, response.linkedItems);
                        } else {
                            this.pins = [];
                        }

                        this.stopLoading();

                        super.detectChanges();
                    })
                )
        );
    }

    private getPins(hotGraphics: TrainingHotGraphic, linkedItems: IContentItemsContainer): TrainingHotGraphicPin[] {
        const pins: TrainingHotGraphicPin[] = [];
        for (const pinCodename of hotGraphics.elements.pins.linkedItemCodenames) {
            const pin: TrainingHotGraphicPin = linkedItems[pinCodename] as TrainingHotGraphicPin;
            pins.push(pin);
        }

        return pins;
    }

    private getDeliveryClient(projectId?: string, previewApiKey?: string): DeliveryClient | undefined {
        if (projectId && previewApiKey) {
            return createDeliveryClient({
                projectId: projectId,
                previewApiKey: previewApiKey,
                defaultQueryConfig: {
                    usePreviewMode: true
                }
            });
        }

        return undefined;
    }

    private getDefaultManagementApiKey(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.previewApiKey;
    }

    private getDefaultTargetLanguageCodename(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.itemLanguage;
    }

    private getDefaultProjectId(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.projectId;
    }

    private getDefaultContentItemCodename(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.itemCodename;
    }

    private isKontentContext(): boolean {
        return environment.production;
    }
}
