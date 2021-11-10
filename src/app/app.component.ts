import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContentItemModels, LanguageVariantModels, ManagementClient, SharedModels } from '@kentico/kontent-management';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CoreComponent } from './core/core.component';
import { IItemsPreviewDialogData, ItemsPreviewDialogComponent } from './dialogs/items-preview-dialog.component';
import { KontentService } from './services/kontent.service';
import { ILanguage, ManagementService } from './services/management.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends CoreComponent implements OnInit, AfterViewChecked {
    // config
    public customElemengHeightPx: number = 500;
    public projectId?: string;
    public managementApiKey?: string;
    public overwriteExistingVariants: boolean = false;

    // base
    public loading: boolean = false;
    public errorMessage?: string;
    public infoMessage?: string;

    // state
    public disabled: boolean = false;

    // context
    public itemId?: string;
    public targetLanguageCodename?: string;

    // languages
    public languages: ILanguage[] = [];
    public selectedLanguage?: ILanguage;

    private client?: ManagementClient;

    constructor(
        private dialog: MatDialog,
        private managementService: ManagementService,
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
                    this.managementApiKey = data.apiKey;
                    this.targetLanguageCodename = data.context.variant.codename;
                    this.itemId = data.context.item.id;
                    this.disabled = data.isDisabled;
                    this.overwriteExistingVariants = data.overwriteExistingVariants ?? false;

                    this.client = this.getManagementClient(this.projectId, this.managementApiKey);

                    if (this.client) {
                        this.initLanguages(this.client);
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
            this.managementApiKey = this.getDefaultManagementApiKey();
            this.targetLanguageCodename = this.getDefaultTargetLanguageCodename();
            this.itemId = this.getDefaultContentItemId();
            this.overwriteExistingVariants = this.getDefaultOverwriteExistingLanguageVariants();

            this.client = this.getManagementClient(this.projectId, this.managementApiKey);

            if (this.client) {
                this.initLanguages(this.client);
            }
        }
    }

    ngAfterViewChecked(): void {
        this.updateElementHeight();
    }

    openPreviewDialog(): void {
        if (!this.client || !this.selectedLanguage || !this.targetLanguageCodename || !this.itemId) {
            return;
        }
        const data: IItemsPreviewDialogData = {
            overwriteExistingVariants: this.overwriteExistingVariants,
            client: this.client,
            fromLanguageCodename: this.selectedLanguage.codename,
            linkedItemId: this.itemId,
            toLanguageCodename: this.targetLanguageCodename
        };

        this.dialog.open(ItemsPreviewDialogComponent, {
            width: '1200px',
            data: data
        });
    }

    async handleRecursiveCopy(): Promise<void> {
        if (this.selectedLanguage && this.client && this.targetLanguageCodename && this.itemId) {
            try {
                this.infoMessage = undefined;
                this.errorMessage = undefined;
                this.loading = true;

                const createdLanguageVariants: LanguageVariantModels.ContentItemLanguageVariant[] = [];
                const processedContentItems: ContentItemModels.ContentItem[] = [];
                const existingContentItems: ContentItemModels.ContentItem[] = [];

                await this.managementService.copyFromLanguageRecursiveAsync({
                    client: this.client,
                    linkedItemId: this.itemId,
                    fromLanguageCodename: this.selectedLanguage.codename,
                    toLanguageCodename: this.targetLanguageCodename,
                    createdLanguageVariants: createdLanguageVariants,
                    contentItemsToCreate: processedContentItems,
                    isPreview: false,
                    overwriteLanguageVariants: this.overwriteExistingVariants,
                    existingContentItems: existingContentItems,
                    processedContentItems: []
                });

                this.infoMessage = `Copied '${createdLanguageVariants.length}' language variants from language '${this.selectedLanguage.codename}' to '${this.targetLanguageCodename}'`;

                this.loading = false;

                super.markForCheck();
            } catch (error) {
                this.loading = false;

                if (error instanceof SharedModels.ContentManagementBaseKontentError) {
                    this.errorMessage = error.message;
                } else {
                    this.errorMessage = 'Failed to copy from language. See console for detailed error';
                }
                super.markForCheck();
                console.error(error);
            }
        }
    }

    private updateElementHeight(): void {
        // update size of Kontent UI
        if (this.isKontentContext()) {
            this.kontentService.updateSizeToMatchHtml(this.customElemengHeightPx);
        }
    }

    private initLanguages(client: ManagementClient): void {
        super.subscribeToObservable(
            this.managementService.getLanguages(client).pipe(
                map((languages) => {
                    // filter out target language as it makes no sense to update same languages
                    this.languages = languages.filter((m) => m.codename !== this.targetLanguageCodename);

                    super.markForCheck();
                })
            )
        );
    }

    private getManagementClient(projectId?: string, apiKey?: string): ManagementClient | undefined {
        if (projectId && apiKey) {
            return new ManagementClient({
                projectId: projectId,
                apiKey: apiKey
            });
        }

        return undefined;
    }

    private getDefaultManagementApiKey(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.apiKey;
    }

    private getDefaultProjectId(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.projectId;
    }

    private getDefaultContentItemId(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.itemId;
    }

    private getDefaultTargetLanguageCodename(): string | undefined {
        if (this.isKontentContext()) {
            return undefined;
        }

        return environment.kontent.targetLanguageCodename;
    }

    private getDefaultOverwriteExistingLanguageVariants(): boolean {
        if (this.isKontentContext()) {
            return false;
        }

        return environment.kontent.overwriteExistingLanguageVariants;
    }

    private isKontentContext(): boolean {
        return environment.production;
    }
}
