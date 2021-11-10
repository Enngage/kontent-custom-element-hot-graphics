import { Injectable } from '@angular/core';
import { DeliveryClient, IContentItemsContainer } from '@kentico/kontent-delivery';

import { Observable, from, map } from 'rxjs';
import { TrainingHotGraphic } from '../models/training_hot_graphic';
import { projectModel } from '../models/_project';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
    constructor() {}

    getHotGrahpics(data: {
        client: DeliveryClient;
        itemCodename: string;
        languageCodename: string;
    }): Observable<{ hotGraphics: TrainingHotGraphic | undefined; linkedItems: IContentItemsContainer }> {
        return from(
            data.client.item<TrainingHotGraphic>(data.itemCodename).languageParameter(data.languageCodename).toPromise()
        ).pipe(
            map((response) => {
                return {
                    hotGraphics: response.data.item,
                    linkedItems: response.data.linkedItems
                };
            })
        );
    }

    findParentHotGraphic(data: {
        client: DeliveryClient;
        pinItemCodename: string;
        languageCodename: string;
    }): Observable<TrainingHotGraphic | undefined> {
        const hotGraphicsContentItems = from(
            data.client
                .items<TrainingHotGraphic>()
                .type(projectModel.contentTypes.training_hot_graphic.codename)
                .languageParameter(data.languageCodename)
                .toAllPromise()
        );

        return hotGraphicsContentItems.pipe(
            map((response) => {
                let candidateParent: TrainingHotGraphic | undefined;

                for (const item of response.data.items) {
                    if (item.elements.pins.value.includes(data.pinItemCodename)) {
                        candidateParent = item;
                    }
                }

                return candidateParent;
            })
        );
    }
}
