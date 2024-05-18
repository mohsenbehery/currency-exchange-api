import { Expose, Transform } from 'class-transformer';

export class TransactionResDto {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id: any;

  @Expose()
  userId: string;

  @Expose()
  amount: number;

  @Expose()
  fromCurrency: string;

  @Expose()
  toCurrency: string;

  @Expose()
  convertedAmount: number;
  @Expose()
  date: Date;
}
