import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'jalali-moment';

@Pipe({
  name: 'jalaliDate'
})

export class JalaliDatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const MomentDate = moment(value, 'YYYY/MM/DD');
    return MomentDate.locale('fa').format('YYYY/M/D');
  }

}

@Pipe({
  name: 'jalaliDatetime'
})

export class JalaliDatetimePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const MomentDate = moment(value, 'YYYY/MM/DD HH:mm:ss');
    return MomentDate.locale('fa').format('YYYY/M/D HH:mm:ss');
  }

}
