import { Injectable } from '@angular/core';
import { OFFER_TEMPLATE } from '../templates/offer.template';
import { NDA_TEMPLATE } from '../templates/nda.template';


@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  getTemplate(type: string): string {
    switch (type) {
      case 'offer':
        return OFFER_TEMPLATE;
      case 'nda':
        return NDA_TEMPLATE;
      default:
        return '';
    }
  }

  parseTemplate(template: string, data: any): string {
    let parsed = template;

    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      parsed = parsed.replace(regex, data[key]);
    });

    return parsed;
  }
}
