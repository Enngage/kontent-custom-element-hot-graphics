import { Injectable } from '@angular/core';
import {
    ContentItemModels,
    ContentTypeModels,
    LanguageModels,
    LanguageVariantModels,
    ManagementClient,
    SharedModels,
    WorkflowModels
} from '@kentico/kontent-management';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ILanguage {
    codename: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private contentTypes: ContentTypeModels.ContentType[] = [];
    private languages: LanguageModels.LanguageModel[] = [];
    private workflowSteps: WorkflowModels.WorkflowStep[] = [];

    constructor() {}

    getLanguages(client: ManagementClient): Observable<ILanguage[]> {
        return from(client.listLanguages().toAllPromise()).pipe(
            map((response) => {
                return response.data.items.map((m) => {
                    const language: ILanguage = {
                        codename: m.codename,
                        name: m.name
                    };

                    return language;
                });
            })
        );
    }

    async copyFromLanguageRecursiveAsync(data: {
        client: ManagementClient;
        fromLanguageCodename: string;
        toLanguageCodename: string;
        linkedItemId: string;
        createdLanguageVariants: LanguageVariantModels.ContentItemLanguageVariant[];
        contentItemsToCreate: ContentItemModels.ContentItem[];
        existingContentItems: ContentItemModels.ContentItem[];
        processedContentItems: ContentItemModels.ContentItem[];
        isPreview: boolean;
        overwriteLanguageVariants: boolean;
    }): Promise<void> {
        if (data.processedContentItems.find(m => m.id === data.linkedItemId)) {
            // item was already processed, skip it (avoid circular recursion)
            return;
        }

        // get data from source item
        const sourceItemVariant = await data.client
            .viewLanguageVariant()
            .byItemId(data.linkedItemId)
            .byLanguageCodename(data.fromLanguageCodename)
            .toPromise();

        const contentItem = (await data.client.viewContentItem().byItemId(data.linkedItemId).toPromise()).data;

        data.processedContentItems.push(contentItem);

        const languages = await this.getOrSetLanguages(data.client);

        // check if item is already created in given language
        const targetLanguage = languages.find((m) => m.codename === data.toLanguageCodename);

        if (!targetLanguage) {
            throw Error(`Invalid language with codename '${data.toLanguageCodename}'`);
        }
        const languageVariants = await data.client.listLanguageVariantsOfItem().byItemId(data.linkedItemId).toPromise();

        const existingTargetItem = languageVariants.data.items.find((m) => m.language.id === targetLanguage.id);

        if (existingTargetItem) {
            // item already exists in given language
            data.existingContentItems.push(contentItem);
        }

        let createVariant = false;

        if (data.overwriteLanguageVariants) {
            createVariant = true;
        } else {
            if (!existingTargetItem) {
                createVariant = true;
            }
        }

        if (createVariant) {
            data.contentItemsToCreate.push(contentItem);
        }

        // upsert item in target language
        if (!data.isPreview && createVariant) {
            const publishedWorkflowStepId = await this.getIdOfPublishedWorkflowStep(data.client);

            // create new version of variant if item is published
            if (existingTargetItem && existingTargetItem.workflowStep.id === publishedWorkflowStepId) {
                await data.client
                    .createNewVersionOfLanguageVariant()
                    .byItemId(data.linkedItemId)
                    .byLanguageCodename(data.toLanguageCodename)
                    .toPromise();
            }

            const targetVariant = await data.client
                .upsertLanguageVariant()
                .byItemId(data.linkedItemId)
                .byLanguageCodename(data.toLanguageCodename)
                .withData((builder) => {
                    return sourceItemVariant.data.elements as any;
                })
                .toPromise();

            data.createdLanguageVariants.push(targetVariant.data);
        }

        // go through all linked items and upsert them as well

        const contentType = await this.getOrSetContentType(data.client, contentItem.type.id);
        for (const element of sourceItemVariant.data.elements) {
            const contentTypeElement = contentType.elements.find((m) => m.id === element.element.id);

            if (contentTypeElement && contentTypeElement.type === 'modular_content') {
                const linkedItemReferences = element.value as SharedModels.IReferenceObject[];
                for (const linkedItemReference of linkedItemReferences) {
                    const linktedItemId = linkedItemReference.id;

                    if (linktedItemId) {
                        await this.copyFromLanguageRecursiveAsync({
                            client: data.client,
                            fromLanguageCodename: data.fromLanguageCodename,
                            toLanguageCodename: data.toLanguageCodename,
                            linkedItemId: linktedItemId,
                            createdLanguageVariants: data.createdLanguageVariants,
                            contentItemsToCreate: data.contentItemsToCreate,
                            isPreview: data.isPreview,
                            overwriteLanguageVariants: data.overwriteLanguageVariants,
                            existingContentItems: data.existingContentItems,
                            processedContentItems: data.processedContentItems
                        });
                    }
                }
            }
        }
    }

    async getOrSetLanguages(client: ManagementClient): Promise<LanguageModels.LanguageModel[]> {
        if (this.languages.length) {
            return this.languages;
        }

        const languages = (await client.listLanguages().toAllPromise()).data.items;

        this.languages.push(...languages);

        return languages;
    }

    async getIdOfPublishedWorkflowStep(client: ManagementClient): Promise<string | undefined> {
        const workflowSteps = await this.getOrSetWorkflowSteps(client);

        return workflowSteps.find((m) => m.codename === 'published')?.id;
    }

    async getOrSetWorkflowSteps(client: ManagementClient): Promise<WorkflowModels.WorkflowStep[]> {
        if (this.workflowSteps.length) {
            return this.workflowSteps;
        }

        const workflowSteps = (await client.listWorkflowSteps().toPromise()).data;

        this.workflowSteps.push(...workflowSteps);

        return workflowSteps;
    }

    async getOrSetContentType(client: ManagementClient, contentItemId: string): Promise<ContentTypeModels.ContentType> {
        const existingContentType = this.contentTypes.find((m) => m.id === contentItemId);

        if (existingContentType) {
            return existingContentType;
        }

        const contentType = (await client.viewContentType().byTypeId(contentItemId).toPromise()).data;

        this.contentTypes.push(contentType);

        return contentType;
    }
}
