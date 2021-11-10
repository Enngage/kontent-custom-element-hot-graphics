import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentItemModels, LanguageVariantModels, ManagementClient, SharedModels } from '@kentico/kontent-management';
import { ManagementService } from '../services/management.service';

export interface IItemsPreviewDialogData {
    client: ManagementClient;
    fromLanguageCodename: string;
    toLanguageCodename: string;
    linkedItemId: string;
    overwriteExistingVariants: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-items-preview-dialog',
    templateUrl: 'items-preview-dialog.component.html'
})
export class ItemsPreviewDialogComponent implements OnInit {
    public contentItems: ContentItemModels.ContentItem[] = [];
    public existingContentItems: ContentItemModels.ContentItem[] = [];
    public loading: boolean = false;
    public errorMessage?: string;
    public infoMessage?: string;

    public overwriteExistingVariants: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private managementService: ManagementService,
        public dialogRef: MatDialogRef<ItemsPreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IItemsPreviewDialogData
    ) {
      this.overwriteExistingVariants = data.overwriteExistingVariants;
    }

    async ngOnInit(): Promise<void> {
        try {
            this.loading = true;
            await this.managementService.copyFromLanguageRecursiveAsync({
                ...this.data,
                createdLanguageVariants: [],
                contentItemsToCreate: this.contentItems,
                isPreview: true,
                overwriteLanguageVariants: this.overwriteExistingVariants,
                existingContentItems: this.existingContentItems,
                processedContentItems: []
            });

            this.loading = false;
            this.cdr.markForCheck();
        } catch (error) {
            this.loading = false;

            if (error instanceof SharedModels.ContentManagementBaseKontentError) {
                this.errorMessage = error.message;
            } else {
                this.errorMessage = 'Failed to copy from language. See console for detailed error';
            }
            this.cdr.markForCheck();
            console.error(error);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
